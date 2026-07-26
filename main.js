/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()

let transaksi = [];
let editingId = null;
function generateId() {
    const id = +new Date();
    return id;
}

/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM

const pemasukan = document.getElementById('incomeList');
const pengeluaran = document.getElementById('expenseList');
document.getElementById('transactionFormDateInput').required = true;

/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 *  - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 *  - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 *  - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 *  - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */

function createTransactionElement(transaction) {
    const card = document.createElement('div');
    card.setAttribute('data-testid', 'transactionItem');
    card.classList.add('transaction-card', transaction.type === 'income' ? 'transaction-card--income' : 'transaction-card--expense');

    const icon = document.createElement('i');
    icon.classList.add(
        'ti',
        transaction.type === 'income' ? 'ti-arrow-down-left' : 'ti-arrow-up-right',
        'transaction-card__icon',
        transaction.type === 'income' ? 'transaction-card__icon--income' : 'transaction-card__icon--expense'
    );
    card.appendChild(icon);

    const infoGroup = document.createElement('div');
    infoGroup.classList.add('transaction-card__info');

    const title = document.createElement('h4');
    title.setAttribute('data-testid', 'transactionItemTitle');
    title.classList.add('transaction-card__title');
    title.textContent = transaction.title;
    infoGroup.appendChild(title);

    const date = document.createElement('p');
    date.setAttribute('data-testid', 'transactionItemDate');
    date.classList.add('transaction-card__date');
    date.textContent = transaction.date;
    infoGroup.appendChild(date);

    const type = document.createElement('p');
    type.setAttribute('data-testid', 'transactionItemType');
    type.classList.add('transaction-card__type');
    type.textContent = transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
    type.style.display = 'none';
    infoGroup.appendChild(type);

    card.appendChild(infoGroup);

    const actionGroup = document.createElement('div');
    actionGroup.classList.add('transaction-card__action');

    const amount = document.createElement('p');
    amount.setAttribute('data-testid', 'transactionItemAmount');
    amount.classList.add('transaction-card__amount', transaction.type === 'income' ? 'transaction-card__amount--income' : 'transaction-card__amount--expense');
    amount.textContent = 'Rp ' + transaction.amount.toLocaleString('id-ID');
    actionGroup.appendChild(amount);

    const wew = document.createElement('div');
    wew.classList.add('transaction-card__actions');

    const button1 = document.createElement('button');
    button1.setAttribute('data-testid', 'transactionItemUbahTypeButton');
    button1.classList.add('btn', 'btn--ubah');
    button1.innerHTML = '<i class="ti ti-arrows-exchange"></i>';
    button1.addEventListener('click', () => {
        transaction.type = transaction.type === 'income' ? 'expense' : 'income';
        saveToStorage();
        document.dispatchEvent(new Event('transaction:updated'));
    });
    wew.appendChild(button1);

    const button2 = document.createElement('button');
    button2.setAttribute('data-testid', 'transactionItemEditTypeButton');
    button2.classList.add('btn', 'btn--edit');
    button2.innerHTML = '<i class="ti ti-edit"></i>';
    button2.addEventListener('click', () => {
        document.getElementById('transactionFormTitleInput').value = transaction.title;
        document.getElementById('transactionFormAmountInput').value = transaction.amount;
        document.getElementById('transactionFormDateInput').value = transaction.date;
        document.getElementById('transactionFormTypeSelect').value = transaction.type;
        const simpan = document.querySelector('.tracker-form__submit');
        simpan.innerText = 'Update';
        editingId = transaction.id;
        document.getElementById('transactionFormTitleInput').focus();
    });
    wew.appendChild(button2);

    const button3 = document.createElement('button');
    button3.setAttribute('data-testid', 'transactionItemDeleteButton');
    button3.classList.add('btn', 'btn--hapus');
    button3.innerHTML = '<i class="ti ti-trash"></i>';
    button3.addEventListener('click', () => {
        const hapus = transaksi.filter(item => item.id !== transaction.id);
        transaksi = hapus;
        document.dispatchEvent(new Event('transaction:updated'));
        saveToStorage();
    });
    wew.appendChild(button3);

    actionGroup.appendChild(wew);
    card.appendChild(actionGroup);
    return card;
}

document.addEventListener('transaction:updated', () => {
    renderTransactions();
    updateDashboard();
});

function renderTransactions(data = transaksi) {
    pemasukan.innerHTML = '';
    pengeluaran.innerHTML = '';

    const dataUrut = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    for (const transaction of dataUrut) {
        const baru = createTransactionElement(transaction);
        if (transaction.type === 'income')
            pemasukan.appendChild(baru);
        else
            pengeluaran.appendChild(baru);
    }
}

// TODO [Basic] Tambahkan event listener 'submit' pada form, panggil e.preventDefault() di dalamnya
// TODO [Basic] Di dalam handler submit, ambil nilai input lalu tambahkan sebagai objek transaksi baru ke array

const formSubmit = document.getElementById('transactionForm');
formSubmit.addEventListener('submit', function (e) {
    e.preventDefault();
    const titleInput = document.getElementById('transactionFormTitleInput').value;
    if (titleInput === '') {
        alert('Harap Mengisi Keterangan!');
        return;
    }
    const amountInput = document.getElementById('transactionFormAmountInput').value;
    if (amountInput < 1) {
        alert('Nominal (Min. 1 Rupiah)!');
        return;
    }
    const dateInput = document.getElementById('transactionFormDateInput').value;
    const typeInput = document.getElementById('transactionFormTypeSelect').value;
    if (editingId !== null) {
        const tambah = transaksi.findIndex(item => item.id === editingId);
        transaksi[tambah] = {
            id: editingId,
            title: titleInput,
            amount: +amountInput,
            date: dateInput,
            type: typeInput,
        };
        const simpan = document.querySelector('.tracker-form__submit');
        simpan.innerText = 'Simpan';
        editingId = null;
    }
    else {
        const transaksiBaru = {
            id: generateId(),
            title: titleInput,
            amount: +amountInput,
            date: dateInput,
            type: typeInput,
        };
        transaksi.push(transaksiBaru);
    }
    document.dispatchEvent(new Event('transaction:updated'));
    saveToStorage();
    formSubmit.reset();
});

/**
 * TODO [Skilled]:
 * Tambahkan validasi input sebelum menyimpan data:
 *  - Tampilkan alert() dan hentikan proses jika judul kosong
 *  - Tampilkan alert() dan hentikan proses jika nominal kurang dari 1
 */

/**
 * TODO [Advanced]:
 * Setiap kali data transaksi berubah, perbarui Panel Dasbor:
 *  - Hitung total pemasukan, total pengeluaran, dan saldo (pemasukan - pengeluaran)
 *  - Tampilkan hasilnya ke elemen yang sesuai di HTML
 */

function updateDashboard() {
    const upSaldo = document.querySelector('.tracker-summary__balance-amount');
    const upPemasukan = document.querySelector('.tracker-summary__stat-amount.tracker-summary__stat-amount--income');
    const upPengeluaran = document.querySelector('.tracker-summary__stat-amount.tracker-summary__stat-amount--expense');
    let totalIncome = 0;
    let totalExpense = 0;
    let saldo = 0;
    for (const transaction of transaksi) {
        if (transaction.type === 'income') {
            totalIncome = totalIncome + transaction.amount;
        }
        else {
            totalExpense = totalExpense + transaction.amount;
        }
    }
    upPemasukan.textContent = totalIncome.toLocaleString('id-ID');
    upPengeluaran.textContent = totalExpense.toLocaleString('id-ID');
    saldo = totalIncome - totalExpense;
    upSaldo.textContent = saldo.toLocaleString('id-ID');
}

/**
 * ========================================================
 * Kriteria 2: Mengelola Penyimpanan Data (Web Storage API)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Data transaksi disimpan ke localStorage menggunakan JSON.stringify(), dan dimuat kembali saat halaman dibuka menggunakan JSON.parse().
 *  - Tombol "Hapus" berfungsi: transaksi yang dihapus langsung hilang dari layar dan dari localStorage.
 */

function saveToStorage() {
    const transaksiAfterConvert = JSON.stringify(transaksi)
    localStorage.setItem('transaksi', transaksiAfterConvert);
}

function ambilLocalStorage() {
    const ConvertAgain = localStorage.getItem('transaksi');
    if (ConvertAgain !== null) {
        const final = JSON.parse(ConvertAgain);
        transaksi = final;
        document.dispatchEvent(new Event('transaction:updated'));
    }
}
ambilLocalStorage();

/**
 * TODO [Skilled]:
 * Tombol "Edit" berfungsi: saat ditekan, formulir (#transactionForm) secara otomatis terisi dengan data transaksi yang dipilih.
 *  - Pengguna dapat mengubah data lalu menyimpan perubahan.
 *  - Formulir kembali ke mode "Tambah" setelah pembaruan selesai.
 */

/**
 * TODO [Advanced]:
 * Gunakan Custom Event sebagai penghubung antara perubahan data dan pembaruan tampilan:
 *  - Kirim sinyal dengan document.dispatchEvent(new Event('transaction:updated')) setiap kali data berubah
 *  - Pasang satu listener untuk event tersebut yang memanggil fungsi render dan update dasbor
 */


/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Tambahkan tombol "Ubah Tipe" pada setiap kartu transaksi:
 *  - Saat diklik, ubah tipe transaksi: 'income' → 'expense' atau 'expense' → 'income'
 *  - Simpan perubahan ke localStorage dan perbarui tampilan
 */

/**
 * TODO [Skilled]:
 * Tambahkan event listener 'input' pada kolom pencarian:
 *  - Filter array transaksi berdasarkan kecocokan kata kunci dengan judul transaksi
 *  - Tampilkan hanya transaksi yang judulnya mengandung kata kunci tersebut
 */
/**
 * TODO [Advanced]:
 * Pastikan fitur pencarian berjalan dengan baik di semua kondisi:
 *  - Saat kolom pencarian dikosongkan, tampilkan kembali seluruh daftar transaksi
 */

const formSearch = document.getElementById('searchTransactionFormTitleInput');
formSearch.addEventListener('input', () => {
    const keyword = formSearch.value.toLowerCase();
    const cocok = transaksi.filter(item => item.title.toLowerCase().includes(keyword));
    renderTransactions(cocok);
});

const bulanElement = document.querySelector('.tracker-header__date');

const namaBulan = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const sekarang = new Date();
bulanElement.textContent = namaBulan[sekarang.getMonth()];

const greeting = document.querySelector('.tracker-header__greeting strong');

function ambilNamaUser() {
    const namaTersimpan = localStorage.getItem('nama');

    if (namaTersimpan !== null) {
        greeting.textContent = namaTersimpan;
        return;
    }

    let user = prompt('Siapakah Anda?');
    if (user === null || user.trim() === '') {
        return false;
    }

    localStorage.setItem('nama', user);
    greeting.textContent = user;
}

ambilNamaUser();
