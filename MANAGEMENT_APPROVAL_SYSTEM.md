# Management Approval System

This document outlines the management approval system implemented in SmartMediChain.

## Overview

The management approval system enforces role-based approval workflows for critical operations in the SmartMediChain platform. Certain actions require approval from designated management roles before they can be completed.

## Management Roles with Approval Authority

The following roles have approval authority:

- **Operations Manager** (`operations_manager`): Responsible for approving operational activities such as order processing and logistics
- **Compliance Manager** (`compliance_manager`): Responsible for approving activities related to regulatory compliance, medicine additions/changes
- **Finance Manager** (`finance_manager`): Responsible for approving financial transactions and high-value orders
- **Senior Manager** (`senior_manager`): Has the highest level of approval authority and can approve role changes and administrative actions

## Additional Operational Roles

- **Pharmacy Stock Manager** (`pharmacy_stock_manager`): Manages pharmacy inventory but requires approval for certain operations
- **Pharmacy Order Manager** (`pharmacy_order_manager`): Manages order placement but requires approval for certain operations

## Approval Workflow

1. When a user performs an action requiring approval, an approval request is created
2. The approval request is routed to the appropriate manager(s) based on the action type
3. Managers can view, approve, or reject requests through the Approvals interface
4. The action is only executed after all required approvals have been granted
5. The user who initiated the request can track its status through the Approvals interface

## Actions Requiring Approval

### User Management
- Creating users with special roles (managers, admin)
- Modifying user roles to or from management positions
- Deactivating management user accounts

### Orders
- High-value orders (over specific thresholds)
- Changes to order status or cancellations
- Special discounts or pricing exceptions

### Medicine Management
- Adding new medicines to the inventory
- Modifying critical medicine information
- Removing medicines from the inventory

## Technical Implementation

The approval system consists of:

1. **Approval Model**: Stores approval requests, their status, and approval history
2. **Approval Controller**: Handles CRUD operations for approval requests
3. **Approval Service**: Manages the business logic of determining required approvals
4. **Approval Middleware**: Intercepts requests and checks if approval is needed
5. **Frontend Components**: UI for submitting, viewing, and managing approval requests

## API Endpoints

- `GET /api/approvals`: Get all approval requests (filtered by user role)
- `GET /api/approvals/:id`: Get a specific approval request
- `POST /api/approvals`: Create a new approval request
- `PUT /api/approvals/:id/approve`: Approve a request
- `PUT /api/approvals/:id/reject`: Reject a request
- `PUT /api/approvals/:id/cancel`: Cancel a request

## Notes on Admin Role

The admin role has system-wide privileges but cannot bypass the approval requirements for actions that require management approval. This ensures proper separation of duties and maintains the integrity of the approval process.
