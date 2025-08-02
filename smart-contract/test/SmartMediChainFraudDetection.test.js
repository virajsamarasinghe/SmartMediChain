const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SmartMediChainFraudDetection", function () {
    let fraudDetection;
    let owner;
    let manager1;
    let manager2;
    let aiOracle;
    let user;

    beforeEach(async function () {
        [owner, manager1, manager2, aiOracle, user] = await ethers.getSigners();

        const SmartMediChainFraudDetection = await ethers.getContractFactory("SmartMediChainFraudDetection");
        fraudDetection = await SmartMediChainFraudDetection.deploy();
        await fraudDetection.waitForDeployment();

        // Setup roles
        await fraudDetection.addManager(manager1.address);
        await fraudDetection.addManager(manager2.address);
        await fraudDetection.addAIOracle(aiOracle.address);
    });

    describe("Order Placement", function () {
        it("Should place an order successfully", async function () {
            const tx = await fraudDetection.connect(user).placeOrder(
                "MED001",
                "Paracetamol",
                100,
                ethers.parseEther("0.01")
            );

            await expect(tx)
                .to.emit(fraudDetection, "OrderPlaced")
                .withArgs(1, "MED001", user.address, 100, ethers.parseEther("1"));

            const order = await fraudDetection.getOrder(1);
            expect(order.medicineId).to.equal("MED001");
            expect(order.medicineName).to.equal("Paracetamol");
            expect(order.quantity).to.equal(100);
        });

        it("Should fail with zero quantity", async function () {
            await expect(
                fraudDetection.connect(user).placeOrder(
                    "MED001",
                    "Paracetamol",
                    0,
                    ethers.parseEther("0.01")
                )
            ).to.be.revertedWith("Quantity must be greater than 0");
        });

        it("Should fail with zero price", async function () {
            await expect(
                fraudDetection.connect(user).placeOrder(
                    "MED001",
                    "Paracetamol",
                    100,
                    0
                )
            ).to.be.revertedWith("Price per unit must be greater than 0");
        });
    });

    describe("Fraud Detection", function () {
        beforeEach(async function () {
            await fraudDetection.connect(user).placeOrder(
                "MED001",
                "Paracetamol",
                100,
                ethers.parseEther("0.01")
            );
        });

        it("Should submit fraud detection result", async function () {
            const reasons = ["Overpricing detected", "Unusual quantity"];
            const tx = await fraudDetection.connect(aiOracle).submitFraudDetection(
                1,
                true,
                2, // RiskLevel.HIGH
                85,
                reasons
            );

            await expect(tx)
                .to.emit(fraudDetection, "FraudDetectionCompleted")
                .withArgs(1, true, 2, 85);

            const result = await fraudDetection.getFraudDetectionResult(1);
            expect(result.isFraud).to.be.true;
            expect(result.riskLevel).to.equal(2);
            expect(result.confidenceScore).to.equal(85);
        });

        it("Should require manager approval for high-risk orders", async function () {
            await fraudDetection.connect(aiOracle).submitFraudDetection(
                1,
                true,
                2, // RiskLevel.HIGH
                85,
                ["Overpricing detected"]
            );

            const requiresApproval = await fraudDetection.doesOrderRequireApproval(1);
            expect(requiresApproval).to.be.true;

            const order = await fraudDetection.getOrder(1);
            expect(order.status).to.equal(3); // OrderStatus.FLAGGED_FOR_REVIEW
        });

        it("Should auto-approve low-risk orders", async function () {
            await fraudDetection.connect(aiOracle).submitFraudDetection(
                1,
                false,
                0, // RiskLevel.LOW
                95,
                []
            );

            const order = await fraudDetection.getOrder(1);
            expect(order.status).to.equal(1); // OrderStatus.APPROVED
        });
    });

    describe("Manager Approval", function () {
        beforeEach(async function () {
            await fraudDetection.connect(user).placeOrder(
                "MED001",
                "Paracetamol",
                100,
                ethers.parseEther("0.01")
            );

            await fraudDetection.connect(aiOracle).submitFraudDetection(
                1,
                true,
                2, // RiskLevel.HIGH
                85,
                ["Overpricing detected"]
            );
        });

        it("Should submit manager approval", async function () {
            const tx = await fraudDetection.connect(manager1).submitManagerApproval(
                1,
                true,
                "John Smith",
                "Senior Manager",
                "Approved after review"
            );

            await expect(tx)
                .to.emit(fraudDetection, "ManagerApprovalSubmitted")
                .withArgs(1, manager1.address, true, "Approved after review");
        });

        it("Should finalize order with sufficient approvals", async function () {
            // First approval
            await fraudDetection.connect(manager1).submitManagerApproval(
                1,
                true,
                "John Smith",
                "Senior Manager",
                "Approved"
            );

            // Second approval (required for HIGH risk)
            const tx = await fraudDetection.connect(manager2).submitManagerApproval(
                1,
                true,
                "Sarah Johnson",
                "Operations Manager",
                "Approved"
            );

            await expect(tx)
                .to.emit(fraudDetection, "OrderFinalApproval")
                .withArgs(1, true, 2, 0);

            const order = await fraudDetection.getOrder(1);
            expect(order.status).to.equal(1); // OrderStatus.APPROVED
        });

        it("Should reject order if any manager rejects", async function () {
            const tx = await fraudDetection.connect(manager1).submitManagerApproval(
                1,
                false,
                "John Smith",
                "Senior Manager",
                "Too risky"
            );

            await expect(tx)
                .to.emit(fraudDetection, "OrderFinalApproval")
                .withArgs(1, false, 0, 1);

            const order = await fraudDetection.getOrder(1);
            expect(order.status).to.equal(2); // OrderStatus.REJECTED
        });

        it("Should prevent duplicate approvals from same manager", async function () {
            await fraudDetection.connect(manager1).submitManagerApproval(
                1,
                true,
                "John Smith",
                "Senior Manager",
                "Approved"
            );

            await expect(
                fraudDetection.connect(manager1).submitManagerApproval(
                    1,
                    false,
                    "John Smith",
                    "Senior Manager",
                    "Changed mind"
                )
            ).to.be.revertedWith("Manager has already submitted approval");
        });
    });

    describe("Access Control", function () {
        it("Should only allow AI Oracle to submit fraud detection", async function () {
            await fraudDetection.connect(user).placeOrder(
                "MED001",
                "Paracetamol",
                100,
                ethers.parseEther("0.01")
            );

            await expect(
                fraudDetection.connect(user).submitFraudDetection(
                    1,
                    false,
                    0,
                    95,
                    []
                )
            ).to.be.reverted;
        });

        it("Should only allow managers to submit approvals", async function () {
            await fraudDetection.connect(user).placeOrder(
                "MED001",
                "Paracetamol",
                100,
                ethers.parseEther("0.01")
            );

            await fraudDetection.connect(aiOracle).submitFraudDetection(
                1,
                true,
                2,
                85,
                ["High risk"]
            );

            await expect(
                fraudDetection.connect(user).submitManagerApproval(
                    1,
                    true,
                    "Fake Manager",
                    "User",
                    "Fake approval"
                )
            ).to.be.reverted;
        });

        it("Should only allow admin to add roles", async function () {
            await expect(
                fraudDetection.connect(user).addManager(user.address)
            ).to.be.reverted;

            await expect(
                fraudDetection.connect(user).addAIOracle(user.address)
            ).to.be.reverted;
        });
    });
});
