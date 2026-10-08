# Sprint 2 Shopping & Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the authenticated customer journey from profile and server-backed cart through COD checkout and owned order history for US-9, US-12, US-13, US-14, and US-15.

**Architecture:** Implement dependency-ordered vertical slices through React/TypeScript → REST/JWT → ASP.NET Core Controller → Service → EF Core/AppDbContext → SQL Server. Controllers derive the customer identifier from JWT; services own validation, ownership, totals, and checkout transactions; DTOs keep persistence entities private.

**Tech Stack:** Node.js 24 LTS, React 19, TypeScript 6, Vite 8, Vitest/Testing Library, .NET 10, ASP.NET Core Web API, EF Core 10, SQL Server, xUnit, JWT.

**Spec:** `docs/superpowers/specs/2026-09-01-sprint2-shopping-ordering-design.md`

## Global Constraints

- The Product Owner approved the “Expected results” in `docs/Sprint_backlog.md` as Sprint 2 Acceptance Criteria.
- Preserve the existing React → REST API → Controller → Service → EF Core → SQL Server architecture.
- All Sprint 2 endpoints require role `Customer` and derive `UserID` from the validated JWT `sub` claim.
- Payment method is exactly `COD`; online payment is outside Sprint 2.
- Order cancellation, admin order management, inventory administration, reporting, password recovery, and password changes remain outside scope.
- Use EF Core migrations for every schema change; never mutate SQL Server schema manually.
- Do not add a repository layer, UI framework, state library, or major dependency.
- Do not modify or revert the user-owned `.agents/skills/architecture/SKILL.md` change in the primary workspace.
- Each task follows red-green-refactor, ends with focused tests, and uses a conventional commit.

## Locked HTTP Contracts

| Method | Route | Request | Success |
| --- | --- | --- | --- |
| GET | `/api/profile` | — | `200 ProfileDto` |
| PUT | `/api/profile` | `UpdateProfileDto` | `200 ProfileDto` |
| GET | `/api/cart` | — | `200 CartDto` |
| POST | `/api/cart/items` | `AddCartItemDto` | `200 CartDto` |
| PUT | `/api/cart/items/{productId:int}` | `UpdateCartItemDto` | `200 CartDto` |
| DELETE | `/api/cart/items/{productId:int}` | — | `204` |
| DELETE | `/api/cart` | — | `204` |
| GET | `/api/addresses` | — | `200 AddressDto[]` |
| POST | `/api/addresses` | `AddressWriteDto` | `201 AddressDto` |
| PUT | `/api/addresses/{id:int}` | `AddressWriteDto` | `200 AddressDto` |
| DELETE | `/api/addresses/{id:int}` | — | `204` |
| POST | `/api/orders` | `CheckoutDto` | `201 OrderDetailDto` |
| GET | `/api/orders?pageNumber=1&pageSize=10` | — | `200 PagedResult<OrderSummaryDto>` |
| GET | `/api/orders/{id:long}` | — | `200 OrderDetailDto` |

---

### Task 1: Activate Sprint 2 Context

**Files:**
- Modify: `AGENTS.md`
- Modify: `.agents/skills/project-context/SKILL.md`
- Modify: `docs/database-erd.md`
- Test: `.agents/tests/validate-skills.ps1`

**Interfaces:**
- Consumes: approved Sprint 2 scope in `docs/Sprint_backlog.md`.
- Produces: repository guidance that identifies Sprint 1 as completed and Sprint 2 as active without authorizing Sprint 3 behavior.

- [ ] **Step 1: Write the failing context assertions**

Add checks to `.agents/tests/validate-skills.ps1` that require `AGENTS.md` and project-context to contain `Sprint 2`, `US-9`, `US-12`, `US-13`, `US-14`, and `US-15`, and retain the exclusion of order cancellation, admin order management, inventory administration, reporting, and password recovery.

```powershell
$activeContext = Get-Content -Raw $agentsPath
foreach ($required in @('Sprint 2', 'US-9', 'US-12', 'US-13', 'US-14', 'US-15')) {
    if ($activeContext -notmatch [regex]::Escape($required)) {
        throw "AGENTS.md is missing active Sprint 2 marker: $required"
    }
}
```

- [ ] **Step 2: Run the validator and verify RED**

Run: `powershell.exe -NoProfile -File .agents/tests/validate-skills.ps1`  
Expected: FAIL because repository context still identifies Sprint 1 as current.

- [ ] **Step 3: Update the canonical context**

Replace only the active-Sprint section in `AGENTS.md` and project-context: Sprint 1 is the completed foundation; Sprint 2 is active with the five approved stories and COD-only scope. Update `docs/database-erd.md` ownership markers so `Address`, `Cart`, `CartItem`, `Order`, and `OrderDetail` are Sprint 2 entities; keep `InventoryTransaction`, password-token behavior, cancellation, and administrative order behavior marked Sprint 3.

- [ ] **Step 4: Run the validator and documentation consistency checks**

Run:

```powershell
powershell.exe -NoProfile -File .agents/tests/validate-skills.ps1
rg -n "Sprint 2|US-9|US-12|US-13|US-14|US-15|COD" AGENTS.md .agents/skills/project-context/SKILL.md docs/database-erd.md
```

Expected: validator PASS and every active-scope term appears in the intended documents.

- [ ] **Step 5: Commit**

```powershell
git add -- AGENTS.md .agents/skills/project-context/SKILL.md .agents/tests/validate-skills.ps1 docs/database-erd.md
git commit -m "docs: activate sprint 2 scope"
```

---

### Task 2: Customer Identity and Profile Slice — US-9

**Files:**
- Create: `backend/src/ECommerce.Api/Extensions/ClaimsPrincipalExtensions.cs`
- Create: `backend/src/ECommerce.Api/Exceptions/InvalidUserIdentityException.cs`
- Modify: `backend/src/ECommerce.Api/Middleware/ExceptionHandlingMiddleware.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Profile/ProfileDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Profile/UpdateProfileDto.cs`
- Create: `backend/src/ECommerce.Api/Services/Profile/IProfileService.cs`
- Create: `backend/src/ECommerce.Api/Services/Profile/ProfileService.cs`
- Create: `backend/src/ECommerce.Api/Controllers/ProfileController.cs`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Modify: `backend/tests/ECommerce.Api.Tests/TestApiFactory.cs`
- Modify: `backend/tests/ECommerce.Api.Tests/ECommerce.Api.Tests.csproj`
- Create: `backend/tests/ECommerce.Api.Tests/ProfileServiceTests.cs`
- Create: `backend/tests/ECommerce.Api.Tests/ProfileControllerTests.cs`
- Create: `frontend/src/services/profileService.ts`
- Create: `frontend/src/pages/ProfilePage.tsx`
- Create: `frontend/src/pages/ProfilePage.test.tsx`
- Create: `frontend/src/routes/RequireCustomer.tsx`
- Create: `frontend/src/routes/RequireCustomer.test.tsx`
- Modify: `frontend/src/routes/AppRouter.tsx`
- Modify: `frontend/src/contexts/AuthContext.tsx`

**Interfaces:**
- Consumes: JWT `sub` and role claims; `AppDbContext.Users`.
- Produces: `ClaimsPrincipal.GetRequiredUserId()`, `IProfileService.GetAsync(int, CancellationToken)`, `IProfileService.UpdateAsync(int, UpdateProfileDto, CancellationToken)`, `/api/profile`, `profileService`, and protected `/profile`.

- [ ] **Step 1: Write failing backend tests**

Test that anonymous requests return 401, Admin returns 403, Customer token with `sub=17` passes `17` to the service, missing/invalid `sub` produces a safe 401, and profile responses exclude `PasswordHash` and `RoleID`. Service tests use EF Core’s SQLite in-memory provider and assert only `FullName`, `Phone`, and `AvatarURL` change.

Add `<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="10.0.11" />` to the test project so relational constraints and transactions are exercised rather than mocked.

```csharp
public interface IProfileService
{
    Task<ProfileDto> GetAsync(int userId, CancellationToken cancellationToken = default);
    Task<ProfileDto> UpdateAsync(int userId, UpdateProfileDto dto, CancellationToken cancellationToken = default);
}

public sealed record ProfileDto(int UserID, string Email, string FullName, string? Phone, string? AvatarURL);

public sealed class UpdateProfileDto
{
    [Required, StringLength(100)] public string FullName { get; init; } = string.Empty;
    [StringLength(20)] public string? Phone { get; init; }
    [StringLength(500)] public string? AvatarURL { get; init; }
}
```

- [ ] **Step 2: Run focused backend tests and verify RED**

Run: `dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~Profile"`  
Expected: FAIL because profile types/endpoints do not exist.

- [ ] **Step 3: Implement identity helper, service, controller, and DI**

`ClaimsPrincipalExtensions.GetRequiredUserId()` reads `JwtRegisteredClaimNames.Sub` or `ClaimTypes.NameIdentifier`, parses a positive integer, and throws the repository’s authentication-safe exception. `ProfileController` uses `[Authorize(Roles = "Customer")]`; no action accepts a user ID.

Define the authentication-safe exception as `InvalidUserIdentityException` and map it to a generic `401` ProblemDetails title `Authentication is required.` without echoing claim contents.

```csharp
[ApiController, Authorize(Roles = "Customer"), Route("api/profile")]
public sealed class ProfileController(IProfileService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ProfileDto>> Get(CancellationToken ct) =>
        Ok(await service.GetAsync(User.GetRequiredUserId(), ct));

    [HttpPut]
    public async Task<ActionResult<ProfileDto>> Update(UpdateProfileDto dto, CancellationToken ct) =>
        Ok(await service.UpdateAsync(User.GetRequiredUserId(), dto, ct));
}
```

- [ ] **Step 4: Run backend tests and verify GREEN**

Run: `dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~Profile|FullyQualifiedName~Auth"`  
Expected: all selected tests PASS.

- [ ] **Step 5: Write failing frontend profile and route tests**

Mock `profileService`; assert `/profile` redirects anonymous users to `/login`, blocks Admin, loads current data, submits trimmed editable fields, renders API validation errors, and updates AuthContext’s displayed `fullName` after success.

```ts
export interface Profile {
  userID: number; email: string; fullName: string; phone?: string; avatarURL?: string
}
export interface UpdateProfileRequest { fullName: string; phone?: string; avatarURL?: string }
```

- [ ] **Step 6: Run frontend profile tests and verify RED**

Run: `npm --prefix frontend test -- ProfilePage RequireCustomer`  
Expected: FAIL because the page, guard, and service do not exist.

- [ ] **Step 7: Implement frontend profile flow**

Add `profileService.get()` and `.update(request)` using `/profile`; add `RequireCustomer`; add the `/profile` route inside `MainLayout`; extend AuthContext with `updateUser(user: UserInfo)` so the header reflects profile changes without changing the JWT.

- [ ] **Step 8: Run slice verification and commit**

Run:

```powershell
dotnet test backend/ECommerce.slnx --configuration Release
npm --prefix frontend test
npm --prefix frontend run build
```

Expected: 0 failures and successful production build.

```powershell
git add -- backend frontend
git commit -m "feat: add customer profile management"
```

---

### Task 3: Server-Backed Cart Slice — US-12

**Files:**
- Create: `backend/src/ECommerce.Api/DTOs/Cart/CartDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Cart/CartItemDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Cart/AddCartItemDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Cart/UpdateCartItemDto.cs`
- Create: `backend/src/ECommerce.Api/Services/Cart/ICartService.cs`
- Create: `backend/src/ECommerce.Api/Services/Cart/CartService.cs`
- Create: `backend/src/ECommerce.Api/Controllers/CartController.cs`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Create: `backend/tests/ECommerce.Api.Tests/CartServiceTests.cs`
- Create: `backend/tests/ECommerce.Api.Tests/CartControllerTests.cs`
- Create: `frontend/src/types/cart.ts`
- Create: `frontend/src/services/cartService.ts`
- Rewrite: `frontend/src/contexts/CartContext.tsx`
- Create: `frontend/src/contexts/CartContext.test.tsx`
- Create: `frontend/src/pages/CartPage.tsx`
- Create: `frontend/src/pages/CartPage.test.tsx`
- Modify: `frontend/src/routes/AppRouter.tsx`
- Modify: `frontend/src/components/Header.tsx`
- Modify: product-detail/list add-to-cart call sites found by `rg -n "addToCart" frontend/src`

**Interfaces:**
- Consumes: authenticated customer ID and active product inventory.
- Produces: `ICartService`, locked `/api/cart` contracts, async CartContext operations, and protected `/cart`.

- [ ] **Step 1: Write failing cart service/controller tests**

Cover empty cart, add, merge duplicate product, replace quantity, remove, clear, inactive/missing product, quantity `<= 0`, insufficient stock, anonymous/Admin rejection, and cross-customer isolation.

```csharp
public interface ICartService
{
    Task<CartDto> GetAsync(int userId, CancellationToken ct = default);
    Task<CartDto> AddAsync(int userId, AddCartItemDto dto, CancellationToken ct = default);
    Task<CartDto> UpdateAsync(int userId, int productId, UpdateCartItemDto dto, CancellationToken ct = default);
    Task RemoveAsync(int userId, int productId, CancellationToken ct = default);
    Task ClearAsync(int userId, CancellationToken ct = default);
}

public sealed record CartItemDto(int ProductID, string ProductName, string SKU, decimal UnitPrice, int Quantity, int StockQuantity, string? ImageURL, decimal LineTotal);
public sealed record CartDto(IReadOnlyList<CartItemDto> Items, int TotalItems, decimal TotalAmount);
```

- [ ] **Step 2: Run cart backend tests and verify RED**

Run: `dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~Cart"`  
Expected: FAIL because cart API/service types do not exist.

- [ ] **Step 3: Implement cart service, controller, and DI**

Use `Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)`. Create the customer cart lazily, merge duplicate lines, validate `IsActive` and `StockQuantity`, calculate totals from current `Product.Price`, and translate unique-key races into the project’s safe conflict response. Apply `[Authorize(Roles = "Customer")]` to the controller.

- [ ] **Step 4: Run cart backend tests and verify GREEN**

Run: `dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~Cart"`  
Expected: all selected tests PASS.

- [ ] **Step 5: Write failing frontend cart tests**

Assert CartProvider loads only when authenticated, exposes `isLoading/error`, performs async add/update/remove/clear, refreshes server state, never reads/writes `ecommerce_cart`, CartPage shows empty/items/totals/errors, and Header links to `/cart` with server count.

```ts
export interface CartContextValue {
  cart: Cart; isLoading: boolean; error: string | null
  refresh(): Promise<void>; add(productID: number, quantity: number): Promise<void>
  update(productID: number, quantity: number): Promise<void>
  remove(productID: number): Promise<void>; clear(): Promise<void>
}
```

- [ ] **Step 6: Run frontend cart tests and verify RED**

Run: `npm --prefix frontend test -- CartContext CartPage Header`  
Expected: FAIL against the localStorage-only cart.

- [ ] **Step 7: Implement server-backed cart UI**

Add typed API methods, rewrite CartContext around the API, route `/cart` through `RequireCustomer`, connect product actions by `productID`, render inline recoverable errors instead of `alert`, and disable each mutation while pending.

- [ ] **Step 8: Verify and commit the cart slice**

Run backend tests, `npm --prefix frontend test`, and `npm --prefix frontend run build`; expect all PASS.

```powershell
git add -- backend frontend
git commit -m "feat: add server backed shopping cart"
```

---

### Task 4: Shipping Address Slice — US-14

**Files:**
- Create: `backend/src/ECommerce.Api/DTOs/Addresses/AddressDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Addresses/AddressWriteDto.cs`
- Create: `backend/src/ECommerce.Api/Services/Addresses/IAddressService.cs`
- Create: `backend/src/ECommerce.Api/Services/Addresses/AddressService.cs`
- Create: `backend/src/ECommerce.Api/Controllers/AddressesController.cs`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Create: `backend/tests/ECommerce.Api.Tests/AddressServiceTests.cs`
- Create: `backend/tests/ECommerce.Api.Tests/AddressesControllerTests.cs`
- Create: `frontend/src/types/address.ts`
- Create: `frontend/src/services/addressService.ts`
- Create: `frontend/src/components/AddressForm.tsx`
- Create: `frontend/src/components/AddressForm.test.tsx`
- Create: `frontend/src/pages/AddressesPage.tsx`
- Create: `frontend/src/pages/AddressesPage.test.tsx`
- Modify: `frontend/src/routes/AppRouter.tsx`

**Interfaces:**
- Consumes: authenticated customer ID and `Addresses` table.
- Produces: `IAddressService`, `/api/addresses`, reusable `AddressForm`, and protected `/addresses`.

- [ ] **Step 1: Write failing backend address tests**

Cover list/create/update/delete ownership, required receiver/full-address fields, phone length, default selection, clearing the previous default in one transaction, first-address defaulting, and deletion without modifying order snapshots.

```csharp
public interface IAddressService
{
    Task<IReadOnlyList<AddressDto>> ListAsync(int userId, CancellationToken ct = default);
    Task<AddressDto> CreateAsync(int userId, AddressWriteDto dto, CancellationToken ct = default);
    Task<AddressDto> UpdateAsync(int userId, int addressId, AddressWriteDto dto, CancellationToken ct = default);
    Task DeleteAsync(int userId, int addressId, CancellationToken ct = default);
}
```

- [ ] **Step 2: Run address tests and verify RED**

Run: `dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~Address"`  
Expected: FAIL because address API/service types do not exist.

- [ ] **Step 3: Implement address backend and verify GREEN**

Filter every query by both `AddressID` and `UserID`. When `IsDefault=true`, clear other defaults and save within an explicit transaction. Apply `[Authorize(Roles = "Customer")]`, register the service, then rerun the focused command; expect PASS.

- [ ] **Step 4: Write failing frontend address tests**

Assert list/empty/loading/error states, create/edit/delete, default badge, confirmation before delete, field validation, and API validation rendering.

- [ ] **Step 5: Implement frontend addresses and verify GREEN**

Add typed service, reusable controlled form, protected `/addresses` page, and responsive address cards. Run `npm --prefix frontend test -- Address`; expect PASS.

- [ ] **Step 6: Run slice verification and commit**

Run all backend/frontend tests and frontend build; expect 0 failures.

```powershell
git add -- backend frontend
git commit -m "feat: add customer shipping addresses"
```

---

### Task 5: Transactional COD Checkout — US-13

**Files:**
- Create: `backend/src/ECommerce.Api/Domain/OrderConstants.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Orders/CheckoutDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Orders/OrderItemDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Orders/OrderDetailDto.cs`
- Create: `backend/src/ECommerce.Api/DTOs/Orders/OrderSummaryDto.cs`
- Create: `backend/src/ECommerce.Api/Services/Orders/IOrderService.cs`
- Create: `backend/src/ECommerce.Api/Services/Orders/OrderService.cs`
- Create: `backend/src/ECommerce.Api/Controllers/OrdersController.cs`
- Modify: `backend/src/ECommerce.Api/Program.cs`
- Create: `backend/tests/ECommerce.Api.Tests/OrderServiceCheckoutTests.cs`
- Create: `backend/tests/ECommerce.Api.Tests/OrdersControllerTests.cs`

**Interfaces:**
- Consumes: customer cart, owned address, COD, Products, Orders, and OrderDetails.
- Produces: `IOrderService.CheckoutAsync`, centralized states, and `POST /api/orders`.

- [ ] **Step 1: Write failing checkout tests**

Cover empty cart, foreign/missing address, non-COD method, missing/inactive product, invalid quantity, insufficient stock, server price snapshots, multi-item totals, zero shipping fee, `PENDING` states, cart clearing only after success, and rollback retaining the cart after injected save failure.

```csharp
public static class OrderConstants
{
    public const string Cod = "COD";
    public const string Pending = "PENDING";
}

public sealed class CheckoutDto
{
    [Range(1, int.MaxValue)] public int AddressID { get; init; }
    [Required] public string PaymentMethod { get; init; } = OrderConstants.Cod;
    [StringLength(1000)] public string? Note { get; init; }
}

public interface IOrderService
{
    Task<OrderDetailDto> CheckoutAsync(int userId, CheckoutDto dto, CancellationToken ct = default);
    Task<PagedResult<OrderSummaryDto>> ListAsync(int userId, int pageNumber, int pageSize, CancellationToken ct = default);
    Task<OrderDetailDto> GetAsync(int userId, long orderId, CancellationToken ct = default);
}
```

- [ ] **Step 2: Run checkout tests and verify RED**

Run: `dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~Checkout|FullyQualifiedName~OrdersController"`  
Expected: FAIL because order service/controller do not exist.

- [ ] **Step 3: Implement transaction-safe checkout**

Begin an EF transaction; load owned address and cart graph; validate all rows before adding the order; snapshot receiver/product values; compute `SubTotal = Σ(UnitPrice × Quantity)`, `ShippingFee = 0m`, and `TotalAmount = SubTotal`; set COD/PENDING constants; add details; remove cart items; call `SaveChangesAsync`; commit. Do not decrement `StockQuantity` because inventory mutation is reserved for Sprint 3, but reject quantities above current stock.

- [ ] **Step 4: Implement controller and verify GREEN**

`POST /api/orders` calls the authenticated customer service and returns `CreatedAtAction(nameof(GetById), new { id = order.OrderID }, order)`. Register `IOrderService`; run the focused tests and expect PASS.

- [ ] **Step 5: Run backend regression and commit**

Run: `dotnet test backend/ECommerce.slnx --configuration Release`  
Expected: all backend tests PASS.

```powershell
git add -- backend
git commit -m "feat: add transactional cod checkout"
```

---

### Task 6: Checkout Frontend Integration — US-13/US-14

**Files:**
- Create: `frontend/src/types/order.ts`
- Create: `frontend/src/services/orderService.ts`
- Create: `frontend/src/pages/CheckoutPage.tsx`
- Create: `frontend/src/pages/CheckoutPage.test.tsx`
- Modify: `frontend/src/pages/CartPage.tsx`
- Modify: `frontend/src/routes/AppRouter.tsx`

**Interfaces:**
- Consumes: `cartService`, `addressService`, `POST /orders`, and protected customer routing.
- Produces: `/checkout`, COD-only submission, and navigation to `/orders/{orderID}`.

- [ ] **Step 1: Write failing checkout page tests**

Assert unauthenticated protection, empty-cart redirect to `/cart`, address loading/selection, link to create an address, COD displayed as the only method, optional note, duplicate-submit prevention, API error retention of cart, and successful navigation to the created order.

```ts
export interface CheckoutRequest { addressID: number; paymentMethod: 'COD'; note?: string }
export const orderService = {
  checkout: (request: CheckoutRequest) => apiClient<OrderDetail>('/orders', {
    method: 'POST', body: JSON.stringify(request),
  }),
}
```

- [ ] **Step 2: Run checkout frontend tests and verify RED**

Run: `npm --prefix frontend test -- CheckoutPage CartPage`  
Expected: FAIL because checkout UI/service do not exist.

- [ ] **Step 3: Implement checkout UI**

Add protected `/checkout`, make CartPage’s checkout button navigate there, load cart and addresses, select the default address when present, hard-code request `paymentMethod: 'COD'`, disable submit while pending, refresh the CartContext after success, and navigate to the returned detail route.

- [ ] **Step 4: Verify and commit**

Run `npm --prefix frontend test` and `npm --prefix frontend run build`; expect PASS.

```powershell
git add -- frontend
git commit -m "feat: integrate cod checkout interface"
```

---

### Task 7: Owned Order History Slice — US-15

**Files:**
- Modify: `backend/src/ECommerce.Api/Services/Orders/OrderService.cs`
- Modify: `backend/src/ECommerce.Api/Controllers/OrdersController.cs`
- Create: `backend/tests/ECommerce.Api.Tests/OrderHistoryServiceTests.cs`
- Modify: `backend/tests/ECommerce.Api.Tests/OrdersControllerTests.cs`
- Modify: `frontend/src/services/orderService.ts`
- Create: `frontend/src/pages/OrderHistoryPage.tsx`
- Create: `frontend/src/pages/OrderHistoryPage.test.tsx`
- Create: `frontend/src/pages/OrderDetailPage.tsx`
- Create: `frontend/src/pages/OrderDetailPage.test.tsx`
- Modify: `frontend/src/routes/AppRouter.tsx`
- Modify: `frontend/src/components/Header.tsx`

**Interfaces:**
- Consumes: order snapshot DTOs created in Task 5.
- Produces: paginated `GET /api/orders`, owned `GET /api/orders/{id}`, `/orders`, and `/orders/:id`.

- [ ] **Step 1: Write failing backend history tests**

Assert newest-first pagination, page-size bounds `1..100`, customer filtering, complete item/address snapshots, 404 for missing and foreign orders, and anonymous/Admin rejection.

- [ ] **Step 2: Run history tests and verify RED**

Run: `dotnet test backend/ECommerce.slnx --configuration Release --filter "FullyQualifiedName~OrderHistory|FullyQualifiedName~OrdersController"`  
Expected: FAIL until list/detail methods are implemented.

- [ ] **Step 3: Implement list/detail backend and verify GREEN**

Use `AsNoTracking()`, filter by `UserID` before projection, order by `CreatedAt DESC` then `OrderID DESC`, project snapshots directly to DTOs, and return the repository’s safe not-found response for any non-owned ID. Run the focused tests; expect PASS.

- [ ] **Step 4: Write failing frontend history/detail tests**

Assert loading/empty/error states, pagination, newest-first cards, links to details, all totals and snapshots, safe missing-order error, and no cancellation/status mutation controls.

- [ ] **Step 5: Implement frontend history/detail**

Extend `orderService.list(pageNumber, pageSize)` and `.get(orderID)`, add protected routes, link the authenticated header to history, and render immutable shipping/product snapshots.

- [ ] **Step 6: Verify and commit**

Run full backend/frontend tests and frontend build; expect 0 failures.

```powershell
git add -- backend frontend
git commit -m "feat: add customer order history"
```

---

### Task 8: Migration, Documentation, and Sprint 2 Verification

**Files:**
- Modify if model differs: `backend/src/ECommerce.Api/Data/Configurations/*.cs`
- Create if model differs: `backend/src/ECommerce.Api/Migrations/<timestamp>_Sprint2ShoppingOrdering.cs`
- Modify if migration created: `backend/src/ECommerce.Api/Migrations/AppDbContextModelSnapshot.cs`
- Modify: `README.md`
- Modify: `docs/architecture.md`
- Modify: `docs/database-erd.md`
- Create: `docs/Sprint2.md`

**Interfaces:**
- Consumes: all completed Sprint 2 slices.
- Produces: reproducible schema, current documentation, passing CI-equivalent suite, and exact demo instructions.

- [ ] **Step 1: Compare EF model with the existing database snapshot**

Run:

```powershell
dotnet ef migrations has-pending-model-changes --project backend/src/ECommerce.Api --startup-project backend/src/ECommerce.Api
```

Expected: exit 0 with no pending changes if existing uniqueness/constraints suffice. If it reports pending changes caused by Sprint 2 configuration, create exactly one migration named `Sprint2ShoppingOrdering`; do not create an empty migration.

- [ ] **Step 2: Validate any required migration**

Run:

```powershell
dotnet ef migrations add Sprint2ShoppingOrdering --project backend/src/ECommerce.Api --startup-project backend/src/ECommerce.Api
dotnet ef migrations script --idempotent --project backend/src/ECommerce.Api --startup-project backend/src/ECommerce.Api
```

Expected when a migration is required: generated SQL contains only reviewed Sprint 2 constraints/indexes and does not drop unrelated tables or columns. Skip both commands when Step 1 proves no model change.

- [ ] **Step 3: Update runtime and Sprint documentation**

Document the locked endpoints, Customer authorization, COD-only behavior, migration result, User Secrets prerequisites, exact run sequence, and demo flow. `docs/Sprint2.md` maps every approved Acceptance Criterion to API/UI/test evidence and explicitly lists Sprint 3 exclusions.

- [ ] **Step 4: Run a clean CI-equivalent verification**

```powershell
dotnet clean backend/ECommerce.slnx --configuration Release
dotnet restore backend/ECommerce.slnx
dotnet build backend/ECommerce.slnx --configuration Release --no-restore
dotnet test backend/ECommerce.slnx --configuration Release --no-build
npm --prefix frontend ci
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
powershell.exe -NoProfile -File .agents/tests/validate-skills.ps1
git diff --check
```

Expected: every command exits 0; backend and frontend report 0 failed tests; build succeeds; validator passes; no whitespace errors.

- [ ] **Step 5: Run scope and secret audits**

```powershell
rg -n -i "password=|pwd=|api[_-]?key|jwt.*key.*[A-Za-z0-9]{16}" --glob '!docs/superpowers/**' --glob '!README.md'
rg -n "online payment|cancel order|inventory admin|revenue report|password reset" backend/src frontend/src
git status --short
```

Expected: no tracked credential values, no Sprint 3 implementation, and only intended documentation/migration changes remain.

- [ ] **Step 6: Commit final documentation/schema evidence**

```powershell
git add -- backend/src/ECommerce.Api/Migrations README.md docs AGENTS.md .agents
git commit -m "docs: complete sprint 2 delivery evidence"
```

- [ ] **Step 7: Prepare review handoff without merging**

Push `feature/sprint2-shopping-ordering`, open a PR into `develop`, include US-9/12/13/14/15 Acceptance Criteria evidence, API/database impact, screenshots, exact test results, and request human review. Do not merge until required CI succeeds and review is present.

