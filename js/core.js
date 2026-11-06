/* ==================================================================
           JAVASCRIPT
           ================================================================== */
        const $ = id => document.getElementById(id);

        /* ---------- Tiện ích ---------- */
        const fmt = n => '$ ' + Number(n).toLocaleString('en-US');

        function escapeHtml(value) {
            return String(value ?? '').replace(/[&<>"']/g, c => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            }[c]));
        }

        /* ---------- Tài khoản (lưu trong localStorage) ----------
           CẢNH BÁO: mật khẩu lưu dạng văn bản thường. Chỉ dùng để thử nghiệm. */
        const USERS_KEY = 'ss_users';
        const SESSION_KEY = 'ss_session';

        function getUsers() {
            return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        }

        function saveUsers(users) {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        function newId() {
            return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        }

        (function seedAdmin() {
            const users = getUsers();
            if (!users.some(u => u.role === 'admin')) {
                users.push({
                    id: 'admin-1',
                    name: 'Admin',
                    email: 'admin@secondsea.vn',
                    password: 'admin123',
                    phone: '',
                    address: '',
                    role: 'admin',
                    protected: true,
                    createdAt: new Date().toISOString()
                });
                saveUsers(users);
            }
        })();

        function register({ name, email, password, phone = '' }) {
            email = email.trim().toLowerCase();
            const users = getUsers();
            if (users.some(u => u.email === email)) {
                throw new Error('Email này đã được đăng ký.');
            }
            const user = {
                id: newId(),
                name: name.trim(),
                email,
                password,
                phone: phone.trim(),
                address: '',
                role: 'customer',
                createdAt: new Date().toISOString()
            };
            users.push(user);
            saveUsers(users);
            return user;
        }

        function login(email, password) {
            const user = getUsers().find(
                u => u.email === email.trim().toLowerCase() && u.password === password
            );
            if (!user) throw new Error('Email hoặc mật khẩu không đúng.');
            localStorage.setItem(SESSION_KEY, user.id);
            return user;
        }

        function logout() {
            localStorage.removeItem(SESSION_KEY);
        }

        function currentUser() {
            const id = localStorage.getItem(SESSION_KEY);
            if (!id) return null;
            return getUsers().find(u => u.id === id) || null;
        }

        function isLoggedIn() {
            return currentUser() !== null;
        }

        function isAdmin() {
            const u = currentUser();
            return !!u && u.role === 'admin';
        }

        function updateUser(id, changes) {
            const users = getUsers();
            const i = users.findIndex(u => u.id === id);
            if (i === -1) throw new Error('Không tìm thấy tài khoản.');
            users[i] = { ...users[i], ...changes };
            saveUsers(users);
            return users[i];
        }

        function deleteUser(id) {
            saveUsers(getUsers().filter(u => u.id !== id || u.protected));
        }

        /* ---------- Giỏ hàng ---------- */
        const CART_KEY = 'ss_cart';
        const ORDERS_KEY = 'ss_orders';
        const SHIPPING_FREE_FROM = 300;   // đơn từ $300 được miễn phí vận chuyển
        const SHIPPING_FEE = 15;          // phí vận chuyển khi chưa đủ điều kiện
        const ORDER_STATUSES = ['Chờ xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];

        function getCart() {
            return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        }

        function saveCart(cart) {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            updateCartCount();
        }

        function addToCart(product) {
            const cart = getCart();
            const item = cart.find(i => i.id === product.id);
            if (item) item.qty += 1;
            else cart.push({ ...product, qty: 1 });
            saveCart(cart);
        }

        function changeQty(id, delta) {
            let cart = getCart();
            const item = cart.find(i => i.id === id);
            if (!item) return;
            item.qty += delta;
            if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
            saveCart(cart);
        }

        function removeFromCart(id) {
            saveCart(getCart().filter(i => i.id !== id));
        }

        function cartTotals(cart) {
            const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
            const shipping = subtotal === 0 ? 0 : (subtotal >= SHIPPING_FREE_FROM ? 0 : SHIPPING_FEE);
            return { subtotal, shipping, total: subtotal + shipping };
        }

        function updateCartCount() {
            const count = getCart().reduce((sum, i) => sum + i.qty, 0);
            $('cart-count').textContent = count;
            $('cart-count').hidden = count === 0;
        }

        function renderCart() {
            const cart = getCart();
            if (cart.length === 0) {
                $('cart-list').innerHTML = '<p class="empty-text">Giỏ hàng đang trống. <a href="#" class="link-blue">Tiếp tục mua sắm</a></p>';
                $('cart-summary').hidden = true;
                return;
            }
            $('cart-summary').hidden = false;
            $('cart-list').innerHTML = cart.map(i => `
                <div class="cart-item">
                    <img src="${escapeHtml(i.image)}" alt="">
                    <div>
                        <h3>${escapeHtml(i.name)}</h3>
                        <p>${fmt(i.price)}</p>
                    </div>
                    <div class="qty">
                        <button data-qty="-1" data-id="${escapeHtml(i.id)}">−</button>
                        <span>${i.qty}</span>
                        <button data-qty="1" data-id="${escapeHtml(i.id)}">+</button>
                    </div>
                    <div class="cart-line">${fmt(i.price * i.qty)}</div>
                    <button class="link-remove" data-remove="${escapeHtml(i.id)}">Xóa</button>
                </div>`).join('');

            const t = cartTotals(cart);
            $('sum-subtotal').textContent = fmt(t.subtotal);
            $('sum-shipping').textContent = t.shipping === 0 ? 'Miễn phí' : fmt(t.shipping);
            $('sum-total').textContent = fmt(t.total);
            $('shipping-note').textContent = t.subtotal >= SHIPPING_FREE_FROM
                ? ''
                : `Miễn phí vận chuyển cho đơn từ ${fmt(SHIPPING_FREE_FROM)}`;
        }

        /* ---------- Thanh toán & đơn hàng ---------- */
        function renderCheckout() {
            const user = currentUser();
            const cart = getCart();
            if (!user || cart.length === 0) return;

            $('co-name').value = user.name;
            $('co-phone').value = user.phone || '';
            $('co-address').value = user.address || '';

            $('co-items').innerHTML = cart.map(i =>
                `<div class="co-line"><span>${escapeHtml(i.name)} × ${i.qty}</span><span>${fmt(i.price * i.qty)}</span></div>`
            ).join('');

            const t = cartTotals(cart);
            $('co-subtotal').textContent = fmt(t.subtotal);
            $('co-shipping').textContent = t.shipping === 0 ? 'Miễn phí' : fmt(t.shipping);
            $('co-total').textContent = fmt(t.total);
        }

        function getOrders() {
            return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
        }

        function saveOrders(orders) {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        }

        function updateOrder(id, changes) {
            const orders = getOrders();
            const i = orders.findIndex(o => o.id === id);
            if (i === -1) return;
            orders[i] = { ...orders[i], ...changes };
            saveOrders(orders);
        }

        function renderMyOrders() {
            const user = currentUser();
            const mine = getOrders().filter(o => o.userId === user.id).reverse();
            $('my-orders').innerHTML = mine.length
                ? mine.map(o => `
                    <div class="order-box">
                        <div class="order-head">
                            <strong>${escapeHtml(o.id)}</strong>
                            <span class="role-pill">${escapeHtml(o.status)}</span>
                        </div>
                        <p class="muted">${new Date(o.createdAt).toLocaleString('vi-VN')} · ${escapeHtml(o.payment)}</p>
                        <ul>${o.items.map(i => `<li>${escapeHtml(i.name)} × ${i.qty}</li>`).join('')}</ul>
                        <p class="order-total">Tổng: ${fmt(o.total)}</p>
                    </div>`).join('')
                : '<p class="empty-text">Bạn chưa có đơn hàng nào.</p>';
        }

        function renderAdminOrders() {
            const orders = getOrders().slice().reverse();
            $('order-rows').innerHTML = orders.length
                ? orders.map(o => `
                    <tr>
                        <td>${escapeHtml(o.id)}</td>
                        <td>${escapeHtml(o.customer.name)}<br><small>${escapeHtml(o.customer.phone)}</small></td>
                        <td>${fmt(o.total)}</td>
                        <td>${escapeHtml(o.payment)}</td>
                        <td>${new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                            <select data-order="${escapeHtml(o.id)}">
                                ${ORDER_STATUSES.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
                            </select>
                        </td>
                    </tr>`).join('')
                : '<tr class="empty-row"><td colspan="6">Chưa có đơn hàng nào.</td></tr>';
        }

        /* ---------- Profile ---------- */
        function renderProfile() {
            const user = currentUser();
            if (!user) return;
            $('p-name').value = user.name;
            $('p-email').value = user.email;
            $('p-phone').value = user.phone || '';
            $('p-address').value = user.address || '';
            $('p-created').textContent = new Date(user.createdAt).toLocaleDateString('vi-VN');
            $('p-role').textContent = user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng';
            $('role-pill').textContent = user.role === 'admin' ? 'ADMIN' : 'KHÁCH HÀNG';
            $('role-pill').classList.toggle('is-admin', user.role === 'admin');
            $('info-msg').textContent = '';
            $('info-msg').classList.remove('is-success');
        }

        /* ---------- Admin ---------- */
        function renderAdmin() {
            const me = currentUser();
            const all = getUsers();
            const q = $('search').value.trim().toLowerCase();
            const users = all.filter(u =>
                !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
            );

            $('stats').textContent =
                `Tổng: ${all.length} tài khoản · Admin: ${all.filter(u => u.role === 'admin').length}`;

            if (users.length === 0) {
                $('user-rows').innerHTML = '<tr class="empty-row"><td colspan="6">Không có tài khoản nào.</td></tr>';
                return;
            }

            $('user-rows').innerHTML = users.map(u => {
                const isSelf = u.id === me.id;
                const locked = isSelf || u.protected;
                const isAdminRole = u.role === 'admin';
                return `
                    <tr>
                        <td>${escapeHtml(u.name)}${isSelf ? ' <em>(bạn)</em>' : ''}</td>
                        <td>${escapeHtml(u.email)}</td>
                        <td>${escapeHtml(u.phone || '—')}</td>
                        <td><span class="role-pill ${isAdminRole ? 'is-admin' : ''}">${isAdminRole ? 'Admin' : 'Khách hàng'}</span></td>
                        <td>${new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                            <div class="actions">
                                <button class="btn-secondary" data-action="role" data-id="${u.id}" ${locked ? 'disabled' : ''}>
                                    ${isAdminRole ? 'Hạ quyền' : 'Cấp admin'}
                                </button>
                                <button class="btn-danger" data-action="delete" data-id="${u.id}" ${locked ? 'disabled' : ''}>
                                    Xóa
                                </button>
                            </div>
                        </td>
                    </tr>`;
            }).join('');
        }

        /* ---------- Điều hướng (ẩn/hiện theo hash) ---------- */
        const VIEWS = ['login', 'register', 'profile', 'admin', 'cart', 'checkout'];
        const PRODUCT_GROUPS = ['t-shirt', 'jacket', 'pants', 'accessories'];

        function updateHeader() {
            const user = currentUser();
            $('user-link').href = user ? '#profile' : '#login';
            $('admin-link').hidden = !(user && user.role === 'admin');
            updateCartCount();
        }

        function route() {
            const hash = location.hash.slice(1);
            let view = VIEWS.includes(hash) ? hash : 'shop';

            if (['profile', 'admin', 'checkout'].includes(view) && !isLoggedIn()) {
                sessionStorage.setItem('ss_next', view);
                view = 'login';
                history.replaceState(null, '', '#login');
            }
            if (view === 'admin' && !isAdmin()) {
                view = 'profile';
                history.replaceState(null, '', '#profile');
            }
            if (view === 'checkout' && getCart().length === 0) {
                view = 'cart';
                history.replaceState(null, '', '#cart');
            }

            document.querySelectorAll('[data-view]').forEach(el => {
                el.hidden = el.dataset.view !== view;
            });

            updateHeader();

            if (view === 'profile') { renderProfile(); renderMyOrders(); }
            if (view === 'admin') { renderAdmin(); renderAdminOrders(); renderAdminProducts(); }
            if (view === 'cart') renderCart();
            if (view === 'checkout') renderCheckout();

            if (view === 'shop' && PRODUCT_GROUPS.includes(hash)) {
                $(hash).scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo(0, 0);
            }
        }

        window.addEventListener('hashchange', route);
