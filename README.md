# SECOND SEA – cấu trúc đã tách

## Cấu trúc thư mục

```text
second-sea-refactored/
├── index.html
├── pages/
│   ├── home.html
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── admin.html
│   ├── cart.html
│   └── checkout.html
├── css/
│   ├── global.css
│   ├── home.css
│   ├── auth-admin.css
│   └── cart-checkout.css
└── js/
    ├── bootstrap.js
    ├── core.js
    ├── events.js
    └── products.js
```

## Chạy dự án trong VS Code

1. Giải nén thư mục.
2. Mở **toàn bộ thư mục `second-sea-refactored`** bằng VS Code.
3. Cài extension **Live Server** nếu chưa có.
4. Nhấn chuột phải `index.html` → **Open with Live Server**.

**Lưu ý:** Không mở `index.html` trực tiếp bằng `file://`. Các file giao diện được nạp bằng `fetch()`, vì vậy cần chạy qua Live Server hoặc một web server local.

## Phân chia trách nhiệm

- `pages/`: HTML theo từng màn hình.
- `css/global.css`: reset, nền tảng, header và tiện ích chung.
- `css/home.css`: banner, danh sách sản phẩm, lợi ích và footer.
- `css/auth-admin.css`: đăng nhập, đăng ký, hồ sơ và quản trị.
- `css/cart-checkout.css`: giỏ hàng, thanh toán, đơn hàng và form sản phẩm admin.
- `js/core.js`: tiện ích, tài khoản, giỏ hàng, đơn hàng, profile, admin và điều hướng.
- `js/events.js`: các sự kiện form/nút và thao tác người dùng.
- `js/products.js`: dữ liệu mẫu, hiển thị sản phẩm và thêm/xóa sản phẩm.

## Tài khoản admin thử nghiệm

- Email: `admin@secondsea.vn`
- Mật khẩu: `admin123`

Dữ liệu hiện tại vẫn dùng `localStorage` như bản gốc. Đây là bản demo frontend, chưa phải hệ thống xác thực an toàn để triển khai thực tế.
