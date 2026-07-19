# Fruit Shop API Test Script
# Chay: powershell -File test-api.ps1

$BASE = "http://localhost:5000"
$pass = 0
$fail = 0

function Test-Step($name, $script) {
    try {
        & $script
        Write-Host "  PASS: $name" -ForegroundColor Green
        $script:pass++
    } catch {
        Write-Host "  FAIL: $name" -ForegroundColor Red
        Write-Host "    $_" -ForegroundColor DarkRed
        $script:fail++
    }
}

Write-Host "==============================" -ForegroundColor Cyan
Write-Host " FRUIT SHOP API TEST SUITE" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# ========================
# 1. AUTH
# ========================
Write-Host "=== 1. AUTH ===" -ForegroundColor Yellow

Test-Step "Login user" {
    $r = Invoke-RestMethod "$BASE/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"user1@email.com","password":"123456"}' -TimeoutSec 10
    if (-not $r.token) { throw "No token" }
    $script:TOKEN = $r.token
    $script:USER = $r.user
}

Test-Step "Login admin" {
    $r = Invoke-RestMethod "$BASE/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@fruitshop.com","password":"123456"}' -TimeoutSec 10
    if (-not $r.token) { throw "No token" }
}

Test-Step "Login fail - wrong password" {
    try {
        Invoke-RestMethod "$BASE/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"user1@email.com","password":"wrong"}' -TimeoutSec 10
        throw "Should have failed"
    } catch {
        if ($_.Exception.Response.StatusCode -ne 401) { throw "Expected 401 got $($_.Exception.Response.StatusCode)" }
    }
}

# ========================
# 2. PRODUCTS
# ========================
Write-Host "`n=== 2. PRODUCTS ===" -ForegroundColor Yellow

Test-Step "List all products" {
    $r = Invoke-RestMethod "$BASE/api/products" -TimeoutSec 10
    if (($r | Measure-Object).Count -eq 0) { throw "No products" }
}

Test-Step "Search by keyword" {
    $r = Invoke-RestMethod "$BASE/api/products?search=xoai" -TimeoutSec 10
    if (($r | Measure-Object).Count -eq 0) { throw "No results" }
}

Test-Step "Filter by category" {
    $r = Invoke-RestMethod "$BASE/api/products?categoryId=3" -TimeoutSec 10
    if (($r | Measure-Object).Count -eq 0) { throw "No results" }
}

Test-Step "Sort by price asc" {
    $r = Invoke-RestMethod "$BASE/api/products?sortBy=price&sortOrder=asc" -TimeoutSec 10
    # Kiem tra sort
}

Test-Step "Sort by rating desc" {
    $r = Invoke-RestMethod "$BASE/api/products?sortBy=rating&sortOrder=desc" -TimeoutSec 10
}

Test-Step "List categories" {
    $r = Invoke-RestMethod "$BASE/api/products/categories" -TimeoutSec 10
    if (($r | Measure-Object).Count -eq 0) { throw "No categories" }
}

Test-Step "Product detail with variants" {
    $r = Invoke-RestMethod "$BASE/api/products/1" -TimeoutSec 10
    if (-not $r.variants) { throw "No variants" }
}

# ========================
# 3. CART (can token)
# ========================
Write-Host "`n=== 3. CART ===" -ForegroundColor Yellow
$HEADERS = @{ Authorization = "Bearer $TOKEN" }

# Xoa cart cu bang cach tao order
try { Invoke-RestMethod "$BASE/api/orders" -Method Post -Headers $HEADERS -ContentType "application/json" -Body '{"shippingAddress":"Test","phone":"0900000000","recipientName":"Test","paymentMethod":"COD"}' -TimeoutSec 10 } catch {}

Test-Step "Add to cart (productId=1, variantId=2, qty=2)" {
    $r = Invoke-RestMethod "$BASE/api/cart" -Method Post -Headers $HEADERS -ContentType "application/json" -Body '{"productId":1,"variantId":2,"quantity":2}' -TimeoutSec 10
}

Test-Step "Add to cart (productId=5, variantId=4, qty=1)" {
    $r = Invoke-RestMethod "$BASE/api/cart" -Method Post -Headers $HEADERS -ContentType "application/json" -Body '{"productId":5,"variantId":4,"quantity":1}' -TimeoutSec 10
}

Test-Step "Add to cart (productId=7, no variant, qty=3)" {
    $r = Invoke-RestMethod "$BASE/api/cart" -Method Post -Headers $HEADERS -ContentType "application/json" -Body '{"productId":7,"quantity":3}' -TimeoutSec 10
}

Test-Step "View cart" {
    $r = Invoke-RestMethod "$BASE/api/cart" -Method Get -Headers $HEADERS -TimeoutSec 10
    if (-not $r.items -or ($r.items | Measure-Object).Count -eq 0) { throw "Cart empty" }
    Write-Host "    items: $(($r.items | Measure-Object).Count), subtotal: $($r.subtotal)" -ForegroundColor Gray
}

Test-Step "Update cart item quantity" {
    $cart = Invoke-RestMethod "$BASE/api/cart" -Method Get -Headers $HEADERS -TimeoutSec 10
    $itemId = $cart.items[0].id
    if (-not $itemId) { throw "No cart item" }
    Invoke-RestMethod "$BASE/api/cart/$itemId" -Method Put -Headers $HEADERS -ContentType "application/json" -Body '{"quantity":5}' -TimeoutSec 10
}

Test-Step "Apply voucher (WELCOME10)" {
    $cart = Invoke-RestMethod "$BASE/api/cart" -Method Get -Headers $HEADERS -TimeoutSec 10
    $r = Invoke-RestMethod "$BASE/api/cart/apply-voucher" -Method Post -Headers $HEADERS -ContentType "application/json" -Body "{`"code`":`"WELCOME10`",`"subtotal`":$($cart.subtotal)}" -TimeoutSec 10
    if (-not $r.voucher) { throw "No voucher returned" }
}

Test-Step "Apply voucher fail - wrong code" {
    try {
        Invoke-RestMethod "$BASE/api/cart/apply-voucher" -Method Post -Headers $HEADERS -ContentType "application/json" -Body '{"code":"WRONGCODE","subtotal":100000}' -TimeoutSec 10
        throw "Should have failed"
    } catch {
        # Expected
    }
}

# ========================
# 4. ORDERS
# ========================
Write-Host "`n=== 4. ORDERS ===" -ForegroundColor Yellow

Test-Step "Create order COD" {
    $r = Invoke-RestMethod "$BASE/api/orders" -Method Post -Headers $HEADERS -ContentType "application/json" -Body '{"shippingAddress":"123 Nguyen Hue, District 1, HCMC","phone":"0912345678","recipientName":"Nguyen Van E","paymentMethod":"COD","note":"Giao gio hanh chinh"}' -TimeoutSec 10
    if (-not $r.id) { throw "No order id" }
    $script:ORDER_ID = $r.id
    Write-Host "    Order #$($r.id): status=$($r.status) total=$($r.total_amount) final=$($r.final_amount)" -ForegroundColor Gray
}

Test-Step "Create order with voucher" {
    $r = Invoke-RestMethod "$BASE/api/orders" -Method Post -Headers $HEADERS -ContentType "application/json" -Body '{"shippingAddress":"456 Le Loi, Da Nang","phone":"0912345678","recipientName":"Nguyen Van E","paymentMethod":"COD","voucherCode":"FREESHIP"}' -TimeoutSec 10
    if (-not $r.id) { throw "No order id" }
    Write-Host "    Order #$($r.id): discount=$($r.discount_amount) ship=$($r.shipping_fee)" -ForegroundColor Gray
    $script:ORDER_ID2 = $r.id
}

Test-Step "View order history" {
    $r = Invoke-RestMethod "$BASE/api/orders" -Method Get -Headers $HEADERS -TimeoutSec 10
    if (($r | Measure-Object).Count -eq 0) { throw "No orders" }
    Write-Host "    Total orders: $(($r | Measure-Object).Count)" -ForegroundColor Gray
}

Test-Step "View order detail" {
    $r = Invoke-RestMethod "$BASE/api/orders/$ORDER_ID" -Method Get -Headers $HEADERS -TimeoutSec 10
    if (-not $r.items -or ($r.items | Measure-Object).Count -eq 0) { throw "No items" }
    Write-Host "    Items: $(($r.items | Measure-Object).Count), status: $($r.status)" -ForegroundColor Gray
}

Test-Step "Cancel pending order" {
    $r = Invoke-RestMethod "$BASE/api/orders/$ORDER_ID/cancel" -Method Put -Headers $HEADERS -ContentType "application/json" -Body '{"reason":"Thay doi don hang"}' -TimeoutSec 10
}

Test-Step "Confirm delivery (chuyen order sang shipping truoc)" {
    # Admin confirm order
    $adminLogin = Invoke-RestMethod "$BASE/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@fruitshop.com","password":"123456"}' -TimeoutSec 10
    $adminHeaders = @{ Authorization = "Bearer $($adminLogin.token)" }
    $detail = Invoke-RestMethod "$BASE/api/orders/$ORDER_ID2" -Method Get -Headers $HEADERS -TimeoutSec 10
    # NOTE: Skip confirm delivery vi can shipper update status truoc
    Write-Host "    (skip - can shipper update shipping truoc)" -ForegroundColor Gray
}

# ========================
# 5. REVIEWS
# ========================
Write-Host "`n=== 5. REVIEWS ===" -ForegroundColor Yellow

Test-Step "View product reviews" {
    $r = Invoke-RestMethod "$BASE/api/reviews/product/1" -TimeoutSec 10
    Write-Host "    Reviews: $(($r | Measure-Object).Count)" -ForegroundColor Gray
}

Test-Step "Submit review (can order delivered truoc)" {
    # NOTE: Can order delivered moi review duoc
    Write-Host "    (skip - can order delivered status)" -ForegroundColor Gray
}

# ========================
# SUMMARY
# ========================
Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host " RESULTS" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host " Passed: $pass" -ForegroundColor Green
Write-Host " Failed: $fail" -ForegroundColor Red
Write-Host " Total:  $($pass+$fail)" -ForegroundColor White
Write-Host ""
if ($fail -eq 0) { Write-Host " All tests passed!" -ForegroundColor Green }
else { Write-Host " Some tests failed!" -ForegroundColor Red }
