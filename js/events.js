/* ---------- Sự kiện ---------- */
        // Thêm vào giỏ (mọi thẻ sản phẩm)
        document.addEventListener('click', e => {
            const btn = e.target.closest('.btn-cart');
            if (!btn) return;
            const p = btn.closest('.product');
            addToCart({
                id: p.dataset.id,
                name: p.dataset.name,
                price: Number(p.dataset.price),
                image: p.dataset.image
            });
            const label = btn.textContent;
            btn.textContent = 'Đã thêm ✓';
            setTimeout(() => { btn.textContent = label; }, 1000);
        });

        $('login-form').addEventListener('submit', e => {
            e.preventDefault();
            try {
                login($('login-email').value, $('login-password').value);
                const next = sessionStorage.getItem('ss_next') || 'profile';
                sessionStorage.removeItem('ss_next');
                location.hash = next;
            } catch (err) {
                $('login-msg').textContent = err.message;
            }
        });

        $('register-form').addEventListener('submit', e => {
            e.preventDefault();
            const password = $('reg-password').value;
            if (password !== $('reg-confirm').value) {
                $('reg-msg').textContent = 'Mật khẩu nhập lại không khớp.';
                return;
            }
            try {
                register({
                    name: $('reg-name').value,
                    email: $('reg-email').value,
                    phone: $('reg-phone').value,
                    password
                });
                login($('reg-email').value, password);
                location.hash = 'profile';
            } catch (err) {
                $('reg-msg').textContent = err.message;
            }
        });

        document.querySelectorAll('[data-logout]').forEach(btn => {
            btn.addEventListener('click', () => {
                logout();
                location.hash = '';
            });
        });

        $('info-form').addEventListener('submit', e => {
            e.preventDefault();
            const user = currentUser();
            updateUser(user.id, {
                name: $('p-name').value.trim(),
                phone: $('p-phone').value.trim(),
                address: $('p-address').value.trim()
            });
            renderProfile();
            $('info-msg').textContent = 'Đã lưu thông tin.';
            $('info-msg').classList.add('is-success');
        });

        $('pw-form').addEventListener('submit', e => {
            e.preventDefault();
            const user = currentUser();
            const msg = $('pw-msg');
            msg.classList.remove('is-success');

            if ($('pw-current').value !== user.password) {
                msg.textContent = 'Mật khẩu hiện tại không đúng.';
            } else if ($('pw-new').value !== $('pw-confirm').value) {
                msg.textContent = 'Mật khẩu nhập lại không khớp.';
            } else {
                updateUser(user.id, { password: $('pw-new').value });
                e.target.reset();
                msg.textContent = 'Đã đổi mật khẩu.';
                msg.classList.add('is-success');
            }
        });

        $('search').addEventListener('input', renderAdmin);

        $('user-rows').addEventListener('click', e => {
            const btn = e.target.closest('button[data-action]');
            if (!btn || btn.disabled) return;
            const id = btn.dataset.id;
            const target = getUsers().find(u => u.id === id);
            if (!target) return;

            if (btn.dataset.action === 'role') {
                updateUser(id, { role: target.role === 'admin' ? 'customer' : 'admin' });
            } else if (btn.dataset.action === 'delete') {
                if (confirm(`Xóa tài khoản "${target.name}"? Thao tác này không hoàn tác được.`)) {
                    deleteUser(id);
                }
            }
            renderAdmin();
        });

        $('order-rows').addEventListener('change', e => {
            const sel = e.target.closest('select[data-order]');
            if (sel) updateOrder(sel.dataset.order, { status: sel.value });
        });

        $('cart-list').addEventListener('click', e => {
            const q = e.target.closest('[data-qty]');
            if (q) {
                changeQty(q.dataset.id, Number(q.dataset.qty));
                renderCart();
                return;
            }
            const r = e.target.closest('[data-remove]');
            if (r) {
                removeFromCart(r.dataset.remove);
                renderCart();
            }
        });

        $('cart-checkout').addEventListener('click', () => {
            location.hash = 'checkout';
        });

        $('checkout-form').addEventListener('submit', e => {
            e.preventDefault();
            const user = currentUser();
            const cart = getCart();
            if (!user || cart.length === 0) return;

            const t = cartTotals(cart);
            const customer = {
                name: $('co-name').value.trim(),
                phone: $('co-phone').value.trim(),
                address: $('co-address').value.trim()
            };
            const order = {
                id: 'DH' + Date.now().toString(36).toUpperCase(),
                userId: user.id,
                customer,
                note: $('co-note').value.trim(),
                payment: document.querySelector('input[name="payment"]:checked').value,
                items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image })),
                subtotal: t.subtotal,
                shipping: t.shipping,
                total: t.total,
                status: 'Chờ xác nhận',
                createdAt: new Date().toISOString()
            };

            const orders = getOrders();
            orders.push(order);
            saveOrders(orders);

            updateUser(user.id, { phone: customer.phone, address: customer.address });
            saveCart([]);

            alert(`Đặt hàng thành công! Mã đơn của bạn: ${order.id}`);
            location.hash = 'profile';
        });

const SEED_PRODUCTS = [
    {
        "id": "p1",
        "name": "Balenciaga Men's T-Shirt",
        "price": 750,
        "image": "anh/T-Shirt1.webp",
        "group": "t-shirt"
    },
    {
        "id": "p2",
        "name": "Man Balenciaga I Automobili Lamborghini Oversized",
        "price": 825,
        "image": "anh/T-Shirt2.webp",
        "group": "t-shirt"
    },
    {
        "id": "p3",
        "name": "Balenciaga | SEGA® Oversized T-Shirt",
        "price": 750,
        "image": "anh/T-Shirt3.jpg",
        "group": "t-shirt"
    },
    {
        "id": "p4",
        "name": "Balenciaga | Sega Oversized T-shirt / Long Sleeves",
        "price": 975,
        "image": "anh/T-Shirt4.webp",
        "group": "t-shirt"
    },
    {
        "id": "p5",
        "name": "Men's Hooded Bomber in Black",
        "price": 3550,
        "image": "anh/jacket1.jpg",
        "group": "jacket"
    },
    {
        "id": "p6",
        "name": "Bodies Padded Layered Hoodie",
        "price": 1790,
        "image": "anh/jacket2.jpg",
        "group": "jacket"
    },
    {
        "id": "p7",
        "name": "Man Balenciaga I Automobili Lamborghini Medium Fit hoodie",
        "price": 1390,
        "image": "anh/jacket3.webp",
        "group": "jacket"
    },
    {
        "id": "p8",
        "name": "Silver Tape Balenciaga Back Large Zip-up Hoodie",
        "price": 1590,
        "image": "anh/jacket4.jpg",
        "group": "jacket"
    },
    {
        "id": "p9",
        "name": "Men's Loose Fit Workwear Pants in Black",
        "price": 1350,
        "image": "anh/pants1.jpg",
        "group": "pants"
    },
    {
        "id": "p10",
        "name": "Men's Denim Stitch Baggy Jeans in Dark Blue",
        "price": 2690,
        "image": "anh/pants2.jpg",
        "group": "pants"
    },
    {
        "id": "p11",
        "name": "Men's Curved Jeans in Black",
        "price": 1200,
        "image": "anh/pants3.jpg",
        "group": "pants"
    },
    {
        "id": "p12",
        "name": "Men's Bumper Stickers Baggy Sweatpants in Black",
        "price": 1250,
        "image": "anh/pants4.jpg",
        "group": "pants"
    },
    {
        "id": "p13",
        "name": "Men's Anchor Crest Signet Ring in Antique Silver",
        "price": 470,
        "image": "anh/accs1.jpg",
        "group": "accessories"
    },
    {
        "id": "p14",
        "name": "Women's Bb Thin Belt in Black",
        "price": 495,
        "image": "anh/accs2.jpg",
        "group": "accessories"
    },
    {
        "id": "p15",
        "name": "Balenciaga BB Icon Beads Necklace",
        "price": 780,
        "image": "anh/accs3.jpg",
        "group": "accessories"
    },
    {
        "id": "p16",
        "name": "Men's Naval Crest Cap in Black",
        "price": 450,
        "image": "anh/accs4.jpg",
        "group": "accessories"
    }
];
