# Fruit Shop API Test Script — Password: 1234567890
$BASE = "http://localhost:5000"
$pass = 0; $fail = 0

function Test-Step($n, $s) { try { & $s; Write-Host "  PASS: $n" -ForegroundColor Green; $script:pass++ } catch { Write-Host "  FAIL: $n" -ForegroundColor Red; Write-Host "    $_" -ForegroundColor DarkRed; $script:fail++ } }

Write-Host "=== FRUIT SHOP API TEST ===" -ForegroundColor Cyan

# ===== 1. AUTH =====
Write-Host "`n=== AUTH ===" -ForegroundColor Yellow
Test-Step "Login user" { $r = Invoke-RestMethod "$BASE/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"user1@email.com","password":"1234567890"}' -TimeoutSec 10; if (-not $r.token) { throw "No token" }; $script:TOKEN = $r.token }
Test-Step "Login admin" { $r = Invoke-RestMethod "$BASE/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@fruitshop.com","password":"1234567890"}' -TimeoutSec 10; if (-not $r.token) { throw "No token" } }
Test-Step "Login shipper" { $r = Invoke-RestMethod "$BASE/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"shipper1@fruitshop.com","password":"1234567890"}' -TimeoutSec 10; if (-not $r.token) { throw "No token" } }
Test-Step "Login wrong password" { try { Invoke-RestMethod "$BASE/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"user1@email.com","password":"wrong"}' -TimeoutSec 10; throw "Should fail" } catch { if ($_.Exception.Response.StatusCode -ne 401) { throw "Expected 401" } } }

$H = @{ Authorization = "Bearer $TOKEN" }

Test-Step "GET /me" { $r = Invoke-RestMethod "$BASE/api/auth/me" -Method Get -Headers $H -TimeoutSec 10; if (-not $r.id) { throw "No user" } }
Test-Step "PUT /profile" { $r = Invoke-RestMethod "$BASE/api/auth/profile" -Method Put -Headers $H -ContentType "application/json" -Body '{"fullname":"Test User"}' -TimeoutSec 10; if (-not $r.fullname) { throw "No update" } }
Test-Step "POST /logout" { $r = Invoke-RestMethod "$BASE/api/auth/logout" -Method Post -Headers $H -TimeoutSec 10; if (-not $r.message) { throw "No message" } }

# New login after profile update
$r2 = Invoke-RestMethod "$BASE/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"user1@email.com","password":"1234567890"}' -TimeoutSec 10; $script:TOKEN = $r2.token; $H = @{ Authorization = "Bearer $TOKEN" }

# ===== 2. PRODUCTS =====
Write-Host "`n=== PRODUCTS ===" -ForegroundColor Yellow
Test-Step "GET /products" { $r = Invoke-RestMethod "$BASE/api/products" -TimeoutSec 10; if (($r | Measure-Object).Count -eq 0) { throw "Empty" } }
Test-Step "Search xoai" { $r = Invoke-RestMethod "$BASE/api/products?search=xoai" -TimeoutSec 10; if (($r | Measure-Object).Count -eq 0) { throw "No results" } }
Test-Step "Filter category 3" { $r = Invoke-RestMethod "$BASE/api/products?categoryId=3" -TimeoutSec 10; if (($r | Measure-Object).Count -eq 0) { throw "No results" } }
Test-Step "Sort price asc" { Invoke-RestMethod "$BASE/api/products?sortBy=price&sortOrder=asc" -TimeoutSec 10 | Out-Null }
Test-Step "Sort rating desc" { Invoke-RestMethod "$BASE/api/products?sortBy=rating&sortOrder=desc" -TimeoutSec 10 | Out-Null }
Test-Step "GET /categories" { $r = Invoke-RestMethod "$BASE/api/products/categories" -TimeoutSec 10; if (($r | Measure-Object).Count -eq 0) { throw "No categories" } }
Test-Step "GET /products/1" { $r = Invoke-RestMethod "$BASE/api/products/1" -TimeoutSec 10; if (-not $r.variants) { throw "No variants" } }

# ===== 3. CART =====
Write-Host "`n=== CART ===" -ForegroundColor Yellow
Test-Step "POST /cart (product 1)" { Invoke-RestMethod "$BASE/api/cart" -Method Post -Headers $H -ContentType "application/json" -Body '{"productId":1,"variantId":2,"quantity":2}' -TimeoutSec 10 | Out-Null }
Test-Step "POST /cart (product 5)" { Invoke-RestMethod "$BASE/api/cart" -Method Post -Headers $H -ContentType "application/json" -Body '{"productId":5,"variantId":4,"quantity":1}' -TimeoutSec 10 | Out-Null }
Test-Step "POST /cart (product 7)" { Invoke-RestMethod "$BASE/api/cart" -Method Post -Headers $H -ContentType "application/json" -Body '{"productId":7,"quantity":3}' -TimeoutSec 10 | Out-Null }
Test-Step "GET /cart" { $r = Invoke-RestMethod "$BASE/api/cart" -Method Get -Headers $H -TimeoutSec 10; if (-not $r.items -or ($r.items | Measure-Object).Count -eq 0) { throw "Cart empty" }; Write-Host "    items: $(($r.items | Measure-Object).Count) subtotal: $($r.subtotal)" -ForegroundColor Gray }
Test-Step "PUT /cart/:id (update qty)" { $cart = Invoke-RestMethod "$BASE/api/cart" -Method Get -Headers $H -TimeoutSec 10; $id = $cart.items[0].id; Invoke-RestMethod "$BASE/api/cart/$id" -Method Put -Headers $H -ContentType "application/json" -Body '{"quantity":5}' -TimeoutSec 10 | Out-Null }
Test-Step "POST /cart/apply-voucher" { $cart2 = Invoke-RestMethod "$BASE/api/cart" -Method Get -Headers $H -TimeoutSec 10; $r = Invoke-RestMethod "$BASE/api/cart/apply-voucher" -Method Post -Headers $H -ContentType "application/json" -Body "{`"code`":`"WELCOME10`",`"subtotal`":$($cart2.subtotal)}" -TimeoutSec 10; if (-not $r.voucher) { throw "No voucher" } }
Test-Step "POST /cart/apply-voucher (wrong code)" { try { Invoke-RestMethod "$BASE/api/cart/apply-voucher" -Method Post -Headers $H -ContentType "application/json" -Body '{"code":"INVALID","subtotal":100000}' -TimeoutSec 10; throw "Should fail" } catch { } }

# ===== 4. ORDERS =====
Write-Host "`n=== ORDERS ===" -ForegroundColor Yellow
# Remove cart items by creating a throwaway order
try { Invoke-RestMethod "$BASE/api/orders" -Method Post -Headers $H -ContentType "application/json" -Body '{"shippingAddress":"Test","phone":"0900000000","recipientName":"Test","paymentMethod":"COD"}' -TimeoutSec 10 } catch {}
# Add fresh cart items
Invoke-RestMethod "$BASE/api/cart" -Method Post -Headers $H -ContentType "application/json" -Body '{"productId":9,"quantity":2}' -TimeoutSec 10 | Out-Null
Invoke-RestMethod "$BASE/api/cart" -Method Post -Headers $H -ContentType "application/json" -Body '{"productId":6,"quantity":1}' -TimeoutSec 10 | Out-Null

Test-Step "POST /orders COD" { $r = Invoke-RestMethod "$BASE/api/orders" -Method Post -Headers $H -ContentType "application/json" -Body '{"shippingAddress":"123 Nguyen Hue, District 1, HCMC","phone":"0912345678","recipientName":"Nguyen Van E","paymentMethod":"COD"}' -TimeoutSec 10; if (-not $r.id) { throw "No order" }; $script:OID = $r.id; Write-Host "    Order #$($r.id): $($r.status) total=$($r.total_amount) final=$($r.final_amount)" -ForegroundColor Gray }
Test-Step "POST /orders voucher" { $r = Invoke-RestMethod "$BASE/api/orders" -Method Post -Headers $H -ContentType "application/json" -Body '{"shippingAddress":"456 Le Loi, Da Nang","phone":"0912345678","recipientName":"Nguyen Van E","paymentMethod":"COD","voucherCode":"FREESHIP"}' -TimeoutSec 10; if (-not $r.id) { throw "No order" }; $script:OID2 = $r.id; Write-Host "    Order #$($r.id): discount=$($r.discount_amount) ship=$($r.shipping_fee)" -ForegroundColor Gray }
Test-Step "GET /orders" { $r = Invoke-RestMethod "$BASE/api/orders" -Method Get -Headers $H -TimeoutSec 10; if (($r | Measure-Object).Count -eq 0) { throw "No orders" }; Write-Host "    Count: $(($r | Measure-Object).Count)" -ForegroundColor Gray }
Test-Step "GET /orders/:id" { $r = Invoke-RestMethod "$BASE/api/orders/$OID" -Method Get -Headers $H -TimeoutSec 10; if (-not $r.items -or ($r.items | Measure-Object).Count -eq 0) { throw "No items" }; Write-Host "    Items: $(($r.items | Measure-Object).Count) status: $($r.status)" -ForegroundColor Gray }
Test-Step "PUT /orders/:id/cancel" { Invoke-RestMethod "$BASE/api/orders/$OID/cancel" -Method Put -Headers $H -ContentType "application/json" -Body '{"reason":"Test cancel"}' -TimeoutSec 10 | Out-Null }

# ===== 5. ADDRESSES =====
Write-Host "`n=== ADDRESSES ===" -ForegroundColor Yellow
Test-Step "POST /addresses" { $r = Invoke-RestMethod "$BASE/api/addresses" -Method Post -Headers $H -ContentType "application/json" -Body '{"recipient_name":"Nguyen Van E","phone":"0912345678","street_address":"123 Test Street","ward":"Ward 1","district":"District 1","city":"HCMC","is_default":true}' -TimeoutSec 10; if (-not $r) { throw "No result" }; $script:AID = $r }
Test-Step "GET /addresses" { $r = Invoke-RestMethod "$BASE/api/addresses" -Method Get -Headers $H -TimeoutSec 10; if (($r | Measure-Object).Count -eq 0) { throw "Empty" } }
Test-Step "PUT /addresses/:id/default" { Invoke-RestMethod "$BASE/api/addresses/$AID/default" -Method Put -Headers $H -TimeoutSec 10 | Out-Null }
Test-Step "DELETE /addresses/:id" { Invoke-RestMethod "$BASE/api/addresses/$AID" -Method Delete -Headers $H -TimeoutSec 10 | Out-Null }

# ===== 6. REVIEWS =====
Write-Host "`n=== REVIEWS ===" -ForegroundColor Yellow
Test-Step "GET /reviews/product/1" { $r = Invoke-RestMethod "$BASE/api/reviews/product/1" -TimeoutSec 10; Write-Host "    Count: $(($r | Measure-Object).Count)" -ForegroundColor Gray }

# ===== SUMMARY =====
Write-Host "`n=== RESULTS ===" -ForegroundColor Cyan
Write-Host " Passed: $pass" -ForegroundColor Green; Write-Host " Failed: $fail" -ForegroundColor Red; Write-Host " Total:  $($pass+$fail)"
if ($fail -eq 0) { Write-Host "ALL TESTS PASSED" -ForegroundColor Green } else { Write-Host "SOME TESTS FAILED" -ForegroundColor Red }