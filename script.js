const firebaseConfig = {
  apiKey: "AIzaSyDGs7J7zNMVip5JiT09vdwq3qqEHEppeYM",
  authDomain: "cutievibe-5bf88.firebaseapp.com",
  databaseURL: "https://cutievibe-5bf88-default-rtdb.firebaseio.com",
  projectId: "cutievibe-5bf88",
  storageBucket: "cutievibe-5bf88.firebasestorage.app",
  messagingSenderId: "467711401786",
  appId: "1:467711401786:web:72f23c0d09ae5aacb1fa03",
  measurementId: "G-4CBKSGFCPG"
};

// Initialize Firebase safely
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let allProducts = [];
let wishlist = [];
let cart = [];

// Hero Slider Control
let currentSlide = 0;
function setSlide(index) {
    currentSlide = index;
    const slider = document.getElementById('heroSlider');
    const dots = document.querySelectorAll('.dot');
    if(slider) {
        slider.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }
}
setInterval(() => { currentSlide = (currentSlide + 1) % 2; setSlide(currentSlide); }, 4000);

// Flash Sale Countdown Timer
function startFlashTimer() {
    let duration = 3 * 60 * 60;
    const timerDisplay = document.getElementById('flashTimer');
    setInterval(() => {
        let hours = Math.floor(duration / 3600);
        let minutes = Math.floor((duration % 3600) / 60);
        let seconds = duration % 60;
        if (timerDisplay) {
            timerDisplay.innerText = `${hours < 10 ? "0"+hours : hours} : ${minutes < 10 ? "0"+minutes : minutes} : ${seconds < 10 ? "0"+seconds : seconds}`;
        }
        if (--duration < 0) duration = 3 * 60 * 60;
    }, 1000);
}
startFlashTimer();

// Fetch Products from local products.json with Fallback Data
async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error("products.json load failed");
        const rawData = await response.json();
        
        allProducts = rawData.map(item => {
            const productTitle = item.name ? (item.brand ? `${item.brand} - ${item.name}` : item.name) : (item.brand || 'Cute Product');
            return {
                title: productTitle,
                price: `₹${item.sellPrice || item.mrp || 299}`,
                image: (item.image && item.image.startsWith('http') && item.image !== "https://via.placeholder.com/200") 
                        ? item.image 
                        : 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500',
                category: item.category || 'all',
                badge: item.discount ? `${item.discount}` : 'Trending 🔥',
                link: '#'
            };
        });

        displayProducts(allProducts.slice(0, 60));
    } catch (error) {
        console.warn("Using default fallback dataset:", error);
        allProducts = [
            { title: "Biba - Printed Floral Kurta Set", price: "₹1,499", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500", category: "Dresses", badge: "50% OFF", link: "#" },
            { title: "Maybelline - Superstay Matte Ink", price: "₹499", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500", category: "Makeup", badge: "30% OFF", link: "#" },
            { title: "Clinique - Moisture Surge Hydrator", price: "₹950", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500", category: "Skincare", badge: "20% OFF", link: "#" },
            { title: "Forever 21 - Casual Oversized Top", price: "₹699", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500", category: "Dresses", badge: "Trending 🔥", link: "#" },
            { title: "Nykaa - All Day Matte Foundation", price: "₹599", image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=500", category: "Makeup", badge: "HOT 🔥", link: "#" },
            { title: "Minimalist - 10% Niacinamide Serum", price: "₹569", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500", category: "Skincare", badge: "10% OFF", link: "#" }
        ];
        displayProducts(allProducts);
    }
}

function displayProducts(products) {
    const container = document.getElementById('productContainer');
    if (!container) return;
    container.innerHTML = '';
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column:span 2; color:#888;">No products found! ✨</p>';
        return;
    }
    products.forEach((item) => {
        const isWish = wishlist.includes(item.title);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <span class="badge">${item.badge || 'Trending 🔥'}</span>
            <button class="wishlist-btn ${isWish ? 'active' : ''}" onclick="toggleWishlist('${item.title.replace(/'/g, "\\'")}', this)">${isWish ? '💖' : '♡'}</button>
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title || 'Cute Product'}</h3>
            <div class="price">${item.price || '₹0'}</div>
            <a href="${item.link || '#'}" target="_blank" class="buy-btn" style="text-decoration:none; margin-bottom: 4px;">Order Directly ➔</a>
            <button class="buy-btn" style="background:#333;" onclick="addToCart('${item.title.replace(/'/g, "\\'")}', '${item.price}')">Add To Bag 🛍️</button>
        `;
        container.appendChild(card);
    });
}

// Search & Sort Handlers
function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allProducts.filter(p => (p.title && p.title.toLowerCase().includes(query)));
    displayProducts(filtered.slice(0, 60));
}

function handleSort() {
    const sortVal = document.getElementById('sortSelect').value;
    let sorted = [...allProducts];
    if (sortVal === 'lowToHigh') {
        sorted.sort((a, b) => parseInt((a.price||'0').replace(/\D/g,'')) - parseInt((b.price||'0').replace(/\D/g,'')));
    } else if (sortVal === 'highToLow') {
        sorted.sort((a, b) => parseInt((b.price||'0').replace(/\D/g,'')) - parseInt((a.price||'0').replace(/\D/g,'')));
    }
    displayProducts(sorted.slice(0, 60));
}

// Cart & Wishlist Drawers
function toggleWishlist(title, btn) {
    const idx = wishlist.indexOf(title);
    if (idx === -1) { wishlist.push(title); btn.innerHTML = '💖'; showToast("Added to Wishlist! 💖"); } 
    else { wishlist.splice(idx, 1); btn.innerHTML = '♡'; showToast("Removed from Wishlist!"); }
    const wishCountEl = document.getElementById('wishlistCount');
    if (wishCountEl) wishCountEl.innerText = wishlist.length;
    renderWishlistDrawer();
}

function addToCart(title, price) {
    cart.push({ title, price });
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) cartCountEl.innerText = cart.length;
    showToast("Added to Shopping Bag! 🛍️");
    renderCartDrawer();
}

function renderWishlistDrawer() {
    const list = document.getElementById('wishlistItemsList');
    if (!list) return;
    if (wishlist.length === 0) { list.innerHTML = '<p class="empty-msg">No saved items yet, bestie! ♡</p>'; return; }
    list.innerHTML = wishlist.map(item => `<div class="drawer-item"><span>${item}</span></div>`).join('');
}

function renderCartDrawer() {
    const list = document.getElementById('cartItemsList');
    if (!list) return;
    if (cart.length === 0) { list.innerHTML = '<p class="empty-msg">Your bag is empty! Add cute fits ✨</p>'; return; }
    let total = 0;
    list.innerHTML = cart.map(item => {
        total += parseInt((item.price||'0').replace(/\D/g,'')) || 0;
        return `<div class="drawer-item"><span>${item.title}</span> <b>${item.price}</b></div>`;
    }).join('');
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.innerText = '₹' + total;
}

function filterProducts(category, e) {
    if (category === 'all') {
        displayProducts(allProducts.slice(0, 60));
    } else {
        const filtered = allProducts.filter(p => {
            if (!p.category) return false;
            const cleanCat = p.category.toString().toLowerCase().replace(/[^a-z]/g, '');
            const targetCat = category.toLowerCase().replace(/[^a-z]/g, '');
            return cleanCat.includes(targetCat) || targetCat.includes(cleanCat);
        });
        displayProducts(filtered.slice(0, 60));
    }
}

function openDrawer(id) { const el = document.getElementById(id); if (el) el.style.display = 'flex'; }
function closeDrawer(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
function openModal(id) { const el = document.getElementById(id); if (el) el.style.display = 'flex'; }
function closeModal(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

function handleCheckout(e) {
    e.preventDefault();
    closeModal('checkoutModal');
    closeDrawer('cartDrawer');
    cart = [];
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) cartCountEl.innerText = 0;
    showToast("Order Placed Successfully! 🎉 Delivery soon cutie!");
}

function openAuth(type) { const el = document.getElementById('authModal'); if (el) el.style.display = 'flex'; switchCard(type); }
function closeAuth() {
    const store = document.getElementById('storeContent');
    if(store && store.style.display === 'none') { alert("Login required bestie! ✨"); return; }
    const el = document.getElementById('authModal');
    if (el) el.style.display = 'none';
}
function switchCard(type) {
    const login = document.getElementById('loginCard');
    const reg = document.getElementById('registerCard');
    if (login) login.style.display = (type === 'login') ? 'block' : 'none';
    if (reg) reg.style.display = (type === 'register') ? 'block' : 'none';
}

function showToast(msg) {
    const toast = document.getElementById('toastMsg');
    if (!toast) return;
    toast.innerText = msg; toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const userId = document.getElementById('regUserId').value.trim();
    const password = document.getElementById('regPassword').value;
    const cpassword = document.getElementById('regCPassword').value;

    if (!/^\d{10}$/.test(phone) || !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/.test(userId) || password !== cpassword) {
        showError(document.getElementById('regError'), "Validation error! Check phone & User ID format.");
        return;
    }

    try {
        const userSnap = await db.ref('users/' + userId).once('value');
        if (userSnap.exists()) { showError(document.getElementById('regError'), "User ID taken!"); return; }
        await db.ref('users/' + userId).set({ fullName: name, phone, email, userId, password, createdAt: new Date().toISOString() });
        showToast("Account created bestie! Ab login karein ✨");
        switchCard('login');
    } catch (err) { showError(document.getElementById('regError'), err.message); }
}

async function handleLogin(e) {
    e.preventDefault();
    const userId = document.getElementById('loginUserId').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const userSnap = await db.ref('users/' + userId).once('value');
        if (!userSnap.exists() || userSnap.val().password !== password) {
            showError(document.getElementById('loginError'), "Invalid Credentials!");
            return;
        }
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('storeContent').style.display = 'block';
        document.getElementById('authNav').innerHTML = `<span style="font-size:12px; font-weight:bold; color:#ff1493;">Hi, ${userSnap.val().fullName} 💕</span>`;
        showToast("Login successful cutie! 💕");
        fetchProducts();
    } catch (err) { showError(document.getElementById('loginError'), err.message); }
}

function showError(el, msg) { 
    if (el) {
        el.innerText = msg; 
        el.style.display = 'block'; 
    }
}

// Reel Viewer Modal Logic
function openReel(imgUrl, title) {
    const reelImg = document.getElementById('reelPreviewImg');
    const reelTitle = document.getElementById('reelTitle');
    if (reelImg) reelImg.src = imgUrl;
    if (reelTitle) reelTitle.innerText = title;
    openModal('reelModal');
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', fetchProducts);