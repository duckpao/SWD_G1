================================================================================
 FRUIT SHOP API — DANH SÁCH URI + TEST BODY
 Base URL: http://localhost:5000
 Token: login -> header Authorization: Bearer <token>
================================================================================

AUTH (/api/auth)
================================================================================

[1] POST /api/auth/register
    Body: { "email": "new@email.com", "password": "1234567890", "name": "Nguyen Van A", "phone": "0912345678", "address": "123 ABC" }
    Auth: No

[2] POST /api/auth/register-admin
    Body: { "email": "admin2@fruitshop.com", "password": "1234567890", "name": "Admin 2", "adminSecret": "duckpao" }
    Auth: No

[3] POST /api/auth/login
    Body: { "email": "user1@email.com", "password": "1234567890" }
    Auth: No
    Res:  { "token": "eyJ...", "user": { "id":6, "fullname":"Nguyen Van E", "email":"user1@email.com", "role":"user" } }

[4] GET  /api/auth/activate?token=<activation_token>
    Auth: No

[5] GET  /api/auth/me
    Header: Authorization: Bearer <token>
    Auth: Yes
    Res:  { "id":6, "fullname":"Nguyen Van E", "email":"user1@email.com", "role":"user", "status":"active" }

[6] PUT  /api/auth/profile
    Header: Authorization: Bearer <token>
    Body: { "fullname":"Ten Moi", "phone":"0999999999", "address":"456 New Street", "avatar_url":"https://...", "date_of_birth":"2000-01-01" }
    Auth: Yes
    Note: Tat ca field deu optional, chi gui field muon cap nhat

[7] POST /api/auth/logout
    Header: Authorization: Bearer <token>
    Auth: Yes

[8] POST /api/auth/forgot-password
    Body: { "email": "user1@email.com" }
    Auth: No

[9] POST /api/auth/reset-password
    Body: { "token": "<reset_token>", "password": "newpassword123" }
    Auth: No
    Note: Token lay tu DB bang /forgot-password

-------------------------------------------------------------------------------
PRODUCTS (/api/products)
-------------------------------------------------------------------------------

[10] GET  /api/products
    Query: ?search=xoai&categoryId=3&minPrice=10000&maxPrice=500000&sortBy=price&sortOrder=asc&page=1&limit=20
    Auth: No
    sortBy: price | popularity | rating | newest (default: newest)
    sortOrder: asc | desc (default: desc)

[11] GET  /api/products/categories
    Auth: No

[12] GET  /api/products/:id
    Auth: No
    Ex: GET /api/products/1

-------------------------------------------------------------------------------
CART (/api/cart)
-------------------------------------------------------------------------------

[13] GET  /api/cart
    Header: Authorization: Bearer <token>
    Auth: Yes

[14] POST /api/cart
    Header: Authorization: Bearer <token>
    Body: { "productId": 1, "variantId": 2, "quantity": 2 }
    Note: Bo qua variantId neu sp khong co variant

[15] PUT  /api/cart/:id
    Header: Authorization: Bearer <token>
    Body: { "quantity": 5 }

[16] DELETE /api/cart/:id
    Header: Authorization: Bearer <token>

[17] POST /api/cart/apply-voucher
    Header: Authorization: Bearer <token>
    Body: { "code": "WELCOME10", "subtotal": 200000 }

-------------------------------------------------------------------------------
ORDERS (/api/orders)
-------------------------------------------------------------------------------

[18] POST /api/orders
    Header: Authorization: Bearer <token>
    Body (co ban):    { "shippingAddress":"123 Nguyen Hue District 1 HCMC", "phone":"0912345678", "recipientName":"Nguyen Van E", "paymentMethod":"COD" }
    Body (voucher):   { "shippingAddress":"123 Nguyen Hue", "phone":"0912345678", "recipientName":"Nguyen Van E", "paymentMethod":"VNPay", "voucherCode":"FREESHIP" }
    Body (full):      { "shippingAddress":"...", "phone":"...", "recipientName":"...", "paymentMethod":"COD", "note":"Giao gio hanh chinh", "voucherCode":"WELCOME10" }
    Note: paymentMethod: COD | VNPay | BankTransfer
          Neu khong muon lay tu cart, truyen items: [{"product_id":1,"variant_id":2,"quantity":2}]

[19] GET  /api/orders
    Header: Authorization: Bearer <token>
    Query: ?page=1&limit=10

[20] GET  /api/orders/:id
    Header: Authorization: Bearer <token>

[21] PUT  /api/orders/:id/cancel
    Header: Authorization: Bearer <token>
    Body: { "reason": "Thay doi don hang" }

[22] PUT  /api/orders/:id/confirm-delivery
    Header: Authorization: Bearer <token>
    Note: Chi confirm duoc khi status = shipping

-------------------------------------------------------------------------------
REVIEWS (/api/reviews)
-------------------------------------------------------------------------------

[23] GET  /api/reviews/product/:productId
    Auth: No
    Ex: GET /api/reviews/product/1

[24] POST /api/reviews
    Header: Authorization: Bearer <token>
    Body: { "productId": 1, "orderId": 3, "variantId": null, "rating": 5, "title": "San pham tot", "comment": "Trai cay tuoi ngon" }
    Note: rating 1-5; Chi review duoc khi order da delivered

-------------------------------------------------------------------------------
ADDRESSES (/api/addresses)
-------------------------------------------------------------------------------

[25] GET  /api/addresses
    Header: Authorization: Bearer <token>
    Auth: Yes

[26] POST /api/addresses
    Header: Authorization: Bearer <token>
    Body: { "recipient_name":"Nguyen Van E", "phone":"0912345678", "street_address":"123 Nguyen Hue", "ward":"Ben Nghe", "district":"District 1", "city":"Ho Chi Minh City", "is_default":true }
    Note: ward, district, city, is_default deu optional

[27] PUT  /api/addresses/:id
    Header: Authorization: Bearer <token>
    Body: { "recipient_name":"Ten Moi", "phone":"0900000000", "street_address":"456 New St", "ward":"...", "district":"...", "city":"...", "is_default":false }

[28] DELETE /api/addresses/:id
    Header: Authorization: Bearer <token>

[29] PUT  /api/addresses/:id/default
    Header: Authorization: Bearer <token>
    Note: Set address nay lam mac dinh

================================================================================
VOUCHERS (seed data)
================================================================================
Code:       Type:    Value:    Condition:
WELCOME10   %        10%       Don dau, max 50k, tu 100k
FREESHIP    fixed    30k       Free ship, tu 200k
ORG50       fixed    50k       Hang huu co, tu 300k (shop 1)
KING20      %        20%       Fruit King, max 100k (shop 2)
SUMMER15    %        15%       Mua he, max 80k
================================================================================
USER TEST (password: 1234567890)
================================================================================
ducbaonguyen508@gmail.com    -> admin
user1@email.com        -> user
shop1@fruitshop.com    -> shopowner
shipper1@fruitshop.com -> shipper
================================================================================