/* ---------- Sản phẩm (lưu trong localStorage, admin quản lý) ---------- */
        const PRODUCTS_KEY = 'ss_products';
        const GROUP_LABELS = { 't-shirt': 'T-Shirt', 'jacket': 'Jacket', 'pants': 'Pants', 'accessories': 'Accessories' };

        function getProducts() {
            const raw = localStorage.getItem(PRODUCTS_KEY);
            if (raw === null) {
                localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
                return SEED_PRODUCTS.map(p => ({ ...p }));
            }
            return JSON.parse(raw);
        }

        function saveProducts(products) {
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        }

        function renderProducts() {
            const products = getProducts();
            Object.keys(GROUP_LABELS).forEach(g => {
                $(g).innerHTML = products.filter(p => p.group === g).map(p => `
                    <div class="product" data-id="${escapeHtml(p.id)}" data-name="${escapeHtml(p.name)}" data-price="${Number(p.price)}" data-image="${escapeHtml(p.image)}">
                        <div class="product-image">
                            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">
                            <div class="add-to-cart"><button class="btn-cart">Thêm vào giỏ</button></div>
                        </div>
                        <h3 class="product-name">${escapeHtml(p.name)}</h3>
                        <p class="price">${fmt(p.price)}</p>
                    </div>`).join('');
            });
        }

        function renderAdminProducts() {
            const products = getProducts();
            $('product-rows').innerHTML = products.length
                ? products.map(p => `
                    <tr>
                        <td><img src="${escapeHtml(p.image)}" class="thumb" alt=""></td>
                        <td>${escapeHtml(p.name)}</td>
                        <td>${fmt(p.price)}</td>
                        <td>${escapeHtml(GROUP_LABELS[p.group] || p.group)}</td>
                        <td><button class="btn-danger" data-del="${escapeHtml(p.id)}">Xóa</button></td>
                    </tr>`).join('')
                : '<tr class="empty-row"><td colspan="5">Chưa có sản phẩm nào.</td></tr>';
        }

        $('product-form').addEventListener('submit', e => {
            e.preventDefault();
            const form = e.target;
            const msg = $('pf-msg');
            const file = $('pf-image').files[0];
            msg.classList.remove('is-success');

            if (!file) {
                msg.textContent = 'Vui lòng chọn ảnh.';
                return;
            }
            if (file.size > 1.5 * 1024 * 1024) {
                msg.textContent = 'Ảnh quá lớn, tối đa 1.5MB.';
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const products = getProducts();
                products.push({
                    id: 'p' + Date.now().toString(36),
                    name: $('pf-name').value.trim(),
                    price: Number($('pf-price').value),
                    image: reader.result,
                    group: $('pf-group').value
                });
                try {
                    saveProducts(products);
                } catch (err) {
                    msg.textContent = 'Không đủ bộ nhớ trình duyệt. Hãy xóa bớt sản phẩm hoặc dùng ảnh nhỏ hơn.';
                    return;
                }
                form.reset();
                msg.textContent = 'Đã thêm sản phẩm.';
                msg.classList.add('is-success');
                renderProducts();
                renderAdminProducts();
            };
            reader.readAsDataURL(file);
        });

        $('product-rows').addEventListener('click', e => {
            const btn = e.target.closest('button[data-del]');
            if (!btn) return;
            const products = getProducts();
            const target = products.find(p => p.id === btn.dataset.del);
            if (target && confirm(`Xóa sản phẩm "${target.name}"?`)) {
                saveProducts(products.filter(p => p.id !== target.id));
                renderProducts();
                renderAdminProducts();
            }
        });

        /* ---------- Khởi động ---------- */
        renderProducts();
        route();
