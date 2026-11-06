// Nạp các phần HTML trước, sau đó mới chạy JavaScript phụ thuộc vào DOM.
const pageFiles = [
    "pages/home.html",
    "pages/cart.html",
    "pages/checkout.html",
    "pages/login.html",
    "pages/register.html",
    "pages/profile.html",
    "pages/admin.html"
];

async function loadPages() {
    const mount = document.getElementById("app-views");

    for (const file of pageFiles) {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`Không thể tải ${file}: ${response.status}`);
        }
        mount.insertAdjacentHTML("beforeend", await response.text());
    }

    // Các file dùng chung phạm vi global (classic scripts), cần nạp đúng thứ tự.
    for (const file of ["js/core.js", "js/events.js", "js/products.js"]) {
        await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = file;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Không thể tải ${file}`));
            document.body.appendChild(script);
        });
    }
}

loadPages().catch(error => {
    console.error(error);
    document.getElementById("app-views").textContent =
        "Không thể tải giao diện. Hãy chạy website bằng Live Server trong VS Code.";
});
