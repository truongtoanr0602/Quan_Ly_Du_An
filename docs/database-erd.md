# Database ERD

## 1. Scope

SQL Server is the primary database and Entity Framework Core is the only application schema-management path. This document is the logical ERD reference; code and migrations must remain consistent with it.

The implementation baseline is .NET 10 with EF Core 10 and SQL Server.

Sprint 1 prioritizes `User`, `Category`, and `Product`. `Address`, `Cart`, `CartItem`, `Order`, and `OrderItem` describe the planned Sprint 2/3 model and must not be implemented by the technical baseline.

## 2. Logical ERD

```mermaid
erDiagram
    USER ||--o{ ADDRESS : owns
    USER ||--|| CART : has
    USER ||--o{ ORDER : places
    CATEGORY ||--o{ PRODUCT : contains
    CART ||--o{ CART_ITEM : contains
    PRODUCT ||--o{ CART_ITEM : referenced_by
    ADDRESS ||--o{ ORDER : used_for
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : referenced_by
```

## 3. Entity Reference

| Entity | Key fields | Constraints and notes | Sprint |
| --- | --- | --- | --- |
| `User` | `Id`, `FullName`, `Email`, `PasswordHash`, `Role`, `CreatedAt` | Email unique after normalization; role is `Admin` or `Customer`; password hash never leaves backend | 1 |
| `Category` | `Id`, `Name`, `Description`, `CreatedAt` | Name unique case-insensitively (`IX_Categories_Name` over a `SQL_Latin1_General_CP1_CI_AS` column); `Product.CategoryId` uses `DeleteBehavior.Restrict` so a Category with Products cannot be deleted. See `docs/acceptance-criteria/US-2-category-management.md` | 1 |
| `Product` | `Id`, `CategoryId`, `Name`, `Description`, `Price`, `Brand`, `ImageUrl`, `StockQuantity`, `CreatedAt`, `UpdatedAt` | Required Category FK; `Price decimal(18,2) >= 0`; stock non-negative | 1 |
| `Address` | `Id`, `UserId`, `ReceiverName`, `Phone`, `AddressLine`, `IsDefault` | Required User FK; default-address invariant belongs to service rules | 2 |
| `Cart` | `Id`, `UserId`, `CreatedAt` | One cart per User | 2 |
| `CartItem` | `Id`, `CartId`, `ProductId`, `Quantity` | Unique Cart/Product pair; quantity positive | 2 |
| `Order` | `Id`, `UserId`, `AddressId`, `Status`, `PaymentMethod`, `TotalAmount`, `CreatedAt`, `UpdatedAt` | COD is initial payment scope; money uses `decimal(18,2)` | 2/3 |
| `OrderItem` | `Id`, `OrderId`, `ProductId`, `Quantity`, `UnitPrice` | Snapshot price uses `decimal(18,2)`; quantity positive | 2 |

## 4. Relationship Rules

- A Category has many Products; each Product has one Category.
- A User has many Addresses, exactly one Cart, and many Orders.
- A Cart has many CartItems; a Product may appear in many CartItems.
- An Order uses one Address and contains at least one OrderItem.
- A Product may be referenced by many OrderItems.
- Delete behavior must be explicit in EF configuration. Do not introduce cascade deletion of business records without Product Owner and team agreement.

## 5. Migration Rules

1. Change the Entity and EF configuration together.
2. Generate an EF Core migration with a task-specific name.
3. Review generated SQL, data-loss warnings, constraints, and indexes.
4. Apply migrations locally and run affected tests.
5. Commit Entity, configuration, migration, ERD update, and API impact together.

Never edit a shared database manually without an equivalent tracked migration. Never rename a field or Entity until API, frontend, data, and migration impacts are agreed.
