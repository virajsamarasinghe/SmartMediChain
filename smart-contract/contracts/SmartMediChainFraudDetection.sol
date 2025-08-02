// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title SmartMediChain Fraud Detection and Approval System
 * @dev Smart contract for logging fraud detection results and managing approvals
 */
contract SmartMediChainFraudDetection is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Role definitions
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AI_ORACLE_ROLE = keccak256("AI_ORACLE_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Counter for order IDs
    Counters.Counter private _orderIdCounter;

    // Enums
    enum OrderStatus {
        PENDING,
        APPROVED,
        REJECTED,
        FLAGGED_FOR_REVIEW,
        FRAUD_DETECTED
    }

    enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    // Structs
    struct Order {
        uint256 orderId;
        string medicineId;
        string medicineName;
        uint256 quantity;
        uint256 pricePerUnit;
        uint256 totalPrice;
        address placedBy;
        uint256 timestamp;
        OrderStatus status;
        bool isActive;
    }

    struct FraudDetectionResult {
        bool isFraud;
        RiskLevel riskLevel;
        uint256 confidenceScore; // Percentage (0-100)
        string[] reasons;
        uint256 timestamp;
        address aiOracle;
    }

    struct ManagerApproval {
        address manager;
        string managerName;
        string role;
        bool approved;
        string comments;
        uint256 timestamp;
    }

    // State variables
    mapping(uint256 => Order) public orders;
    mapping(uint256 => FraudDetectionResult) public fraudDetectionResults;
    mapping(uint256 => ManagerApproval[]) public managerApprovals;
    mapping(uint256 => bool) public requiresManagerApproval;

    // Events
    event OrderPlaced(
        uint256 indexed orderId,
        string medicineId,
        address indexed placedBy,
        uint256 quantity,
        uint256 totalPrice
    );

    event FraudDetectionCompleted(
        uint256 indexed orderId,
        bool isFraud,
        RiskLevel riskLevel,
        uint256 confidenceScore
    );

    event ManagerApprovalSubmitted(
        uint256 indexed orderId,
        address indexed manager,
        bool approved,
        string comments
    );

    event OrderStatusChanged(
        uint256 indexed orderId,
        OrderStatus oldStatus,
        OrderStatus newStatus
    );

    event OrderFinalApproval(
        uint256 indexed orderId,
        bool approved,
        uint256 totalApprovals,
        uint256 totalRejections
    );

    // Constructor
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        _grantRole(AI_ORACLE_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    /**
     * @dev Place a new order for fraud detection and approval
     * @param medicineId The ID of the medicine being ordered
     * @param medicineName The name of the medicine
     * @param quantity The quantity being ordered
     * @param pricePerUnit The price per unit
     */
    function placeOrder(
        string memory medicineId,
        string memory medicineName,
        uint256 quantity,
        uint256 pricePerUnit
    ) external returns (uint256) {
        require(quantity > 0, "Quantity must be greater than 0");
        require(pricePerUnit > 0, "Price per unit must be greater than 0");

        _orderIdCounter.increment();
        uint256 orderId = _orderIdCounter.current();

        orders[orderId] = Order({
            orderId: orderId,
            medicineId: medicineId,
            medicineName: medicineName,
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            totalPrice: quantity * pricePerUnit,
            placedBy: msg.sender,
            timestamp: block.timestamp,
            status: OrderStatus.PENDING,
            isActive: true
        });

        emit OrderPlaced(orderId, medicineId, msg.sender, quantity, quantity * pricePerUnit);

        return orderId;
    }

    /**
     * @dev Submit fraud detection result from AI model
     * @param orderId The order ID to submit fraud detection for
     * @param isFraud Whether fraud was detected
     * @param riskLevel The risk level assessment
     * @param confidenceScore The confidence score (0-100)
     * @param reasons Array of fraud detection reasons
     */
    function submitFraudDetection(
        uint256 orderId,
        bool isFraud,
        RiskLevel riskLevel,
        uint256 confidenceScore,
        string[] memory reasons
    ) external onlyRole(AI_ORACLE_ROLE) {
        require(orders[orderId].isActive, "Order does not exist or is inactive");
        require(confidenceScore <= 100, "Confidence score must be <= 100");

        fraudDetectionResults[orderId] = FraudDetectionResult({
            isFraud: isFraud,
            riskLevel: riskLevel,
            confidenceScore: confidenceScore,
            reasons: reasons,
            timestamp: block.timestamp,
            aiOracle: msg.sender
        });

        // Update order status based on fraud detection
        OrderStatus newStatus;
        if (isFraud || riskLevel == RiskLevel.HIGH || riskLevel == RiskLevel.CRITICAL) {
            newStatus = OrderStatus.FLAGGED_FOR_REVIEW;
            requiresManagerApproval[orderId] = true;
        } else if (riskLevel == RiskLevel.MEDIUM) {
            newStatus = OrderStatus.FLAGGED_FOR_REVIEW;
            requiresManagerApproval[orderId] = true;
        } else {
            newStatus = OrderStatus.APPROVED;
        }

        OrderStatus oldStatus = orders[orderId].status;
        orders[orderId].status = newStatus;

        emit FraudDetectionCompleted(orderId, isFraud, riskLevel, confidenceScore);
        emit OrderStatusChanged(orderId, oldStatus, newStatus);
    }

    /**
     * @dev Submit manager approval for an order
     * @param orderId The order ID to approve/reject
     * @param approved Whether the manager approves the order
     * @param managerName The name of the manager
     * @param role The role of the manager
     * @param comments Additional comments from the manager
     */
    function submitManagerApproval(
        uint256 orderId,
        bool approved,
        string memory managerName,
        string memory role,
        string memory comments
    ) external onlyRole(MANAGER_ROLE) {
        require(orders[orderId].isActive, "Order does not exist or is inactive");
        require(requiresManagerApproval[orderId], "Order does not require manager approval");

        // Check if this manager has already submitted approval
        ManagerApproval[] storage approvals = managerApprovals[orderId];
        for (uint i = 0; i < approvals.length; i++) {
            require(approvals[i].manager != msg.sender, "Manager has already submitted approval");
        }

        managerApprovals[orderId].push(ManagerApproval({
            manager: msg.sender,
            managerName: managerName,
            role: role,
            approved: approved,
            comments: comments,
            timestamp: block.timestamp
        }));

        emit ManagerApprovalSubmitted(orderId, msg.sender, approved, comments);

        // Check if we have enough approvals to finalize the order
        _checkAndFinalizeOrder(orderId);
    }

    /**
     * @dev Internal function to check and finalize order based on approvals
     * @param orderId The order ID to check
     */
    function _checkAndFinalizeOrder(uint256 orderId) internal {
        ManagerApproval[] storage approvals = managerApprovals[orderId];
        
        uint256 approvalCount = 0;
        uint256 rejectionCount = 0;
        
        for (uint i = 0; i < approvals.length; i++) {
            if (approvals[i].approved) {
                approvalCount++;
            } else {
                rejectionCount++;
            }
        }

        // Require at least 2 approvals for high-risk orders, 1 for medium-risk
        uint256 requiredApprovals = (fraudDetectionResults[orderId].riskLevel == RiskLevel.HIGH || 
                                   fraudDetectionResults[orderId].riskLevel == RiskLevel.CRITICAL) ? 2 : 1;

        OrderStatus oldStatus = orders[orderId].status;
        bool finalApproved = false;

        if (rejectionCount > 0) {
            // Any rejection means the order is rejected
            orders[orderId].status = OrderStatus.REJECTED;
        } else if (approvalCount >= requiredApprovals) {
            // Sufficient approvals
            orders[orderId].status = OrderStatus.APPROVED;
            finalApproved = true;
        }

        if (orders[orderId].status != oldStatus) {
            emit OrderStatusChanged(orderId, oldStatus, orders[orderId].status);
            emit OrderFinalApproval(orderId, finalApproved, approvalCount, rejectionCount);
        }
    }

    /**
     * @dev Get order details
     * @param orderId The order ID to retrieve
     */
    function getOrder(uint256 orderId) external view returns (Order memory) {
        require(orders[orderId].isActive, "Order does not exist or is inactive");
        return orders[orderId];
    }

    /**
     * @dev Get fraud detection result for an order
     * @param orderId The order ID to retrieve fraud detection for
     */
    function getFraudDetectionResult(uint256 orderId) external view returns (FraudDetectionResult memory) {
        require(orders[orderId].isActive, "Order does not exist or is inactive");
        return fraudDetectionResults[orderId];
    }

    /**
     * @dev Get all manager approvals for an order
     * @param orderId The order ID to retrieve approvals for
     */
    function getManagerApprovals(uint256 orderId) external view returns (ManagerApproval[] memory) {
        require(orders[orderId].isActive, "Order does not exist or is inactive");
        return managerApprovals[orderId];
    }

    /**
     * @dev Get the current order counter
     */
    function getCurrentOrderId() external view returns (uint256) {
        return _orderIdCounter.current();
    }

    /**
     * @dev Check if an order requires manager approval
     * @param orderId The order ID to check
     */
    function doesOrderRequireApproval(uint256 orderId) external view returns (bool) {
        return requiresManagerApproval[orderId];
    }

    /**
     * @dev Emergency function to deactivate an order (admin only)
     * @param orderId The order ID to deactivate
     */
    function deactivateOrder(uint256 orderId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(orders[orderId].isActive, "Order is already inactive");
        orders[orderId].isActive = false;
        orders[orderId].status = OrderStatus.REJECTED;
    }

    /**
     * @dev Add a new manager (admin only)
     * @param manager The address of the new manager
     */
    function addManager(address manager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MANAGER_ROLE, manager);
    }

    /**
     * @dev Add a new AI oracle (admin only)
     * @param oracle The address of the new AI oracle
     */
    function addAIOracle(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(AI_ORACLE_ROLE, oracle);
    }

    /**
     * @dev Add a new auditor (admin only)
     * @param auditor The address of the new auditor
     */
    function addAuditor(address auditor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(AUDITOR_ROLE, auditor);
    }
}
