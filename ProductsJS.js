// Elementos principales
const productsGrid = document.getElementById("productsGrid");
const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");
const searchInput = document.getElementById("searchInput");

const inventorySection = document.getElementById("inventorySection");
const saleSection = document.getElementById("saleSection");

let editingCard = null;

// Cuando un producto no tiene foto, se muestra la primera letra de su nombre
function getEmoji(name) {
    return name.trim().charAt(0).toUpperCase() || "?";
}

// Si una imagen no carga (sin internet o archivo no existe), mostrar la letra
productsGrid.addEventListener("error", (event) => {
    if (event.target.tagName === "IMG") {
        // Probar otras extensiones (jpg, jpeg, png, webp, avif) antes de rendirse
        const extensions = ["jpg", "jpeg", "png", "webp", "avif"];
        const match = (event.target.getAttribute("src") || "")
            .match(/^(imagen\/[^.]+)\.(\w+)$/);
        if (match) {
            const index = extensions.indexOf(match[2].toLowerCase());
            if (index >= 0 && index < extensions.length - 1) {
                event.target.src = match[1] + "." + extensions[index + 1];
                return;
            }
        }

        // Si no hay foto propia, usar la foto de internet de respaldo
        const fallback = event.target.dataset.fallback;
        if (fallback && event.target.getAttribute("src") !== fallback) {
            event.target.src = fallback;
            return;
        }

        const card = event.target.closest(".product-card");
        const name = card.querySelector(".product-details h3").textContent;
        const category = card.querySelector(".category").textContent;

        const placeholder = document.createElement("span");
        placeholder.className = "product-placeholder";
        placeholder.textContent = getEmoji(name, category);
        event.target.replaceWith(placeholder);
    }
}, true);

// Por si las imágenes ya fallaron antes de que cargara este script
document.querySelectorAll(".product-image img").forEach(img => {
    if (img.complete && img.naturalWidth === 0) {
        img.dispatchEvent(new Event("error", { bubbles: false }));
    }
});

// Cambiar entre las pestañas
document.getElementById("inventoryTab").addEventListener("click", () => {
    inventorySection.classList.remove("hidden");
    saleSection.classList.add("hidden");
    document.getElementById("inventoryTab").classList.add("active");
    document.getElementById("saleTab").classList.remove("active");
});

document.getElementById("saleTab").addEventListener("click", () => {
    inventorySection.classList.add("hidden");
    saleSection.classList.remove("hidden");
    document.getElementById("saleTab").classList.add("active");
    document.getElementById("inventoryTab").classList.remove("active");
    updateSaleProducts();
});

// Abrir formulario para agregar producto
document.getElementById("addProductBtn").addEventListener("click", () => {
    editingCard = null;
    productForm.reset();
    document.getElementById("modalTitle").textContent = "Add New Product";
    productModal.classList.remove("hidden");
});

// Cerrar ventana
document.getElementById("closeModal").addEventListener("click", () => {
    productModal.classList.add("hidden");
});

productModal.addEventListener("click", (event) => {
    if (event.target === productModal) {
        productModal.classList.add("hidden");
    }
});

// Guardar producto nuevo o cambios
productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value;
    const price = Number(document.getElementById("productPrice").value);
    const stock = document.getElementById("productStock").value;
    const unit = document.getElementById("productUnit").value;

    if (!name || !category || price < 0 || stock === "") {
        alert("Please complete all product fields.");
        return;
    }

    if (editingCard) {
        editingCard.dataset.name = name;
        editingCard.querySelector(".product-details h3").textContent = name;
        editingCard.querySelector(".product-details .category").textContent = category;
        editingCard.querySelector(".product-details .price").textContent =
            "B/. " + price.toFixed(2);
        editingCard.querySelector(".stock strong").textContent = stock + " " + unit;

        // La imagen puede no existir (productos nuevos o imagen no encontrada)
        const image = editingCard.querySelector(".product-image img");
        if (image) {
            image.alt = name;
        }

    } else {
        const card = document.createElement("article");
        card.className = "product-card";
        card.dataset.name = name;

        card.innerHTML = `
            <div class="product-info">
                <div class="product-image">
                    <span class="product-placeholder">${getEmoji(name, category)}</span>
                </div>
                <div class="product-details">
                    <span class="category"></span>
                    <h3></h3>
                    <p class="price"></p>
                </div>
            </div>
            <div class="stock">
                <span>Stock:</span>
                <strong></strong>
            </div>
            <div class="card-actions">
                <button class="edit-btn" onclick="editProduct(this)">✎ Edit</button>
                <button class="delete-btn" onclick="deleteProduct(this)">▣ Delete</button>
            </div>
        `;

        card.querySelector(".category").textContent = category;
        card.querySelector(".product-details h3").textContent = name;
        card.querySelector(".price").textContent = "B/. " + price.toFixed(2);
        card.querySelector(".stock strong").textContent = stock + " " + unit;

        productsGrid.insertBefore(card, document.getElementById("addProductBtn"));
    }

    productModal.classList.add("hidden");
    productForm.reset();
    updateSaleProducts();
    applySearch();
});

// Editar producto
function editProduct(button) {
    editingCard = button.closest(".product-card");

    document.getElementById("modalTitle").textContent = "Edit Product";
    document.getElementById("productName").value =
        editingCard.querySelector(".product-details h3").textContent;
    document.getElementById("productCategory").value =
        editingCard.querySelector(".product-details .category").textContent;
    document.getElementById("productPrice").value =
        editingCard.querySelector(".product-details .price").textContent
            .replace("B/.", "").trim();
    document.getElementById("productStock").value =
        parseInt(editingCard.querySelector(".stock strong").textContent) || 0;

    const units = ["Unit", "lb", "Bottle", "Pack", "Dozen"];
    const stockText = editingCard.querySelector(".stock strong").textContent;
    const unit = units.find(item => stockText.endsWith(item));
    document.getElementById("productUnit").value = unit || "Unit";

    productModal.classList.remove("hidden");
}

// Eliminar producto (con ventana de confirmación propia)
const deleteModal = document.getElementById("deleteModal");
let cardToDelete = null;

function deleteProduct(button) {
    cardToDelete = button.closest(".product-card");
    const name = cardToDelete.querySelector(".product-details h3").textContent;
    document.getElementById("deleteMessage").textContent =
        `Are you sure you want to delete ${name}?`;
    deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
    deleteModal.classList.add("hidden");
    cardToDelete = null;
}

document.getElementById("cancelDelete").addEventListener("click", closeDeleteModal);

document.getElementById("confirmDelete").addEventListener("click", () => {
    if (cardToDelete) {
        cardToDelete.remove();
        updateSaleProducts();
    }
    closeDeleteModal();
});

deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});

// Buscar productos
function applySearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    document.querySelectorAll(".product-card").forEach(card => {
        const name = card.querySelector(".product-details h3").textContent.toLowerCase();
        const category = card.querySelector(".category").textContent.toLowerCase();

        card.style.display =
            name.includes(searchTerm) || category.includes(searchTerm) ? "" : "none";
    });

    document.getElementById("addProductBtn").style.display = "";
}

searchInput.addEventListener("input", applySearch);

// Actualizar opciones de productos para las ventas
function updateSaleProducts() {
    const select = document.getElementById("saleProduct");
    const previousValue = select.value;

    select.innerHTML = '<option value="">Select a product</option>';

    document.querySelectorAll(".product-card").forEach(card => {
        const name = card.querySelector(".product-details h3").textContent;
        const price = card.querySelector(".product-details .price").textContent;

        const option = document.createElement("option");
        option.value = name;
        option.textContent = `${name} - ${price}`;
        select.appendChild(option);
    });

    if ([...select.options].some(option => option.value === previousValue)) {
        select.value = previousValue;
    }
}

// Registrar venta fiada
document.getElementById("saleForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const client = document.getElementById("saleClient").value.trim();
    const productName = document.getElementById("saleProduct").value;
    const quantity = Number(document.getElementById("saleQuantity").value);

    const card = [...document.querySelectorAll(".product-card")]
        .find(item =>
            item.querySelector(".product-details h3").textContent === productName
        );

    if (!card || quantity < 1) {
        alert("Please select a valid product and quantity.");
        return;
    }

    const stockElement = card.querySelector(".stock strong");
    const stockText = stockElement.textContent;
    const availableStock = parseInt(stockText);

    if (quantity > availableStock) {
        alert("Not enough stock available.");
        return;
    }

    const priceText = card.querySelector(".product-details .price")
        .textContent.replace("B/.", "").trim();
    const total = Number(priceText) * quantity;

    // Actualizar inventario
    const unit = stockText.replace(/^\d+\s*/, "");
    stockElement.textContent = (availableStock - quantity) + " " + unit;

    // Mostrar venta registrada
    const sale = document.createElement("div");
    sale.className = "sale-item";

    const saleDescription = document.createElement("p");
    saleDescription.textContent =
        `${client} — ${productName} x ${quantity} — Total: B/. ${total.toFixed(2)}`;

    const pending = document.createElement("strong");
    pending.textContent = "Pending payment";

    sale.append(saleDescription, pending);
    document.getElementById("salesList").prepend(sale);

    document.getElementById("saleForm").reset();
    document.getElementById("saleQuantity").value = 1;

    alert("Fiado sale registered successfully!");
});

// Preparar las opciones de venta al cargar
updateSaleProducts();