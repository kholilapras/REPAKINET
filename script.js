const paketList = [];
const atribut = {
    kuota: { bobot: 1 / 3, jenis: "benefit" },
    harga: { bobot: 1 / 3, jenis: "cost" },
    masaAktif: { bobot: 1 / 3, jenis: "benefit" }
};

function formatRupiah(angka) {
    return angka.toLocaleString("id-ID");
}

function formatInputRupiah(value) {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

document.getElementById("harga").addEventListener("input", function (e) {
    e.target.value = formatInputRupiah(e.target.value);
});

document.getElementById("harga").addEventListener("keypress", function (e) {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
});

function showError(message) {
    const alert = document.getElementById("alertError");
    alert.classList.remove("d-none");
    alert.innerText = message;
}

function clearError() {
    const alert = document.getElementById("alertError");
    alert.classList.add("d-none");
    alert.innerText = "";
}

function tambahPaket() {
    clearError();
    const kuota = parseFloat(document.getElementById("kuota").value);
    const harga = parseInt(document.getElementById("harga").value.replace(/\./g, ""));
    const masaAktif = parseFloat(document.getElementById("masaAktif").value);
    const keterangan = document.getElementById("keterangan").value.trim();

    if (isNaN(kuota) || isNaN(harga) || isNaN(masaAktif) || harga <= 0) {
        showError("Mohon isi semua data dengan benar dan harga tidak boleh 0.");
        return;
    }

    paketList.push({ kuota, harga, masaAktif, keterangan });
    tampilkanTabel();

    document.getElementById("kuota").value = "";
    document.getElementById("harga").value = "";
    document.getElementById("masaAktif").value = "";
    document.getElementById("keterangan").value = "";
}

function tampilkanTabel() {
    const tbody = document.querySelector("#tabelPaket tbody");
    tbody.innerHTML = "";
    paketList.forEach((paket, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${paket.kuota} GB</td>
      <td>Rp${formatRupiah(paket.harga)}</td>
      <td>${paket.masaAktif} Hari</td>
      <td>${paket.keterangan || '-'}</td>
      <td>
        <button class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#modalHapus" data-index="${index}">Hapus</button>
      </td>
    `;
        tbody.appendChild(row);
    });
}

function hitungTopsis() {
    clearError();
    if (paketList.length === 0) {
        showError("Belum ada paket yang ditambahkan.");
        return;
    }

    const norm = {};
    Object.keys(atribut).forEach(k => {
        norm[k] = Math.sqrt(paketList.reduce((sum, p) => sum + Math.pow(p[k], 2), 0));
    });

    const matrix = paketList.map((p, i) => {
        const obj = { index: i };
        Object.keys(atribut).forEach(k => {
            obj[k] = (p[k] / norm[k]) * atribut[k].bobot;
        });
        return obj;
    });

    const ideal = {}, antiIdeal = {};
    Object.keys(atribut).forEach(k => {
        const values = matrix.map(m => m[k]);
        ideal[k] = atribut[k].jenis === "benefit" ? Math.max(...values) : Math.min(...values);
        antiIdeal[k] = atribut[k].jenis === "benefit" ? Math.min(...values) : Math.max(...values);
    });

    const skor = matrix.map(v => {
        const dPlus = Math.sqrt(Object.keys(atribut).reduce((sum, k) => sum + Math.pow(v[k] - ideal[k], 2), 0));
        const dMin = Math.sqrt(Object.keys(atribut).reduce((sum, k) => sum + Math.pow(v[k] - antiIdeal[k], 2), 0));
        return { index: v.index, skor: dMin / (dPlus + dMin) };
    });

    skor.sort((a, b) => b.skor - a.skor);
    const skorTertinggi = skor[0].skor;
    const semuaTerbaik = skor.filter(s => s.skor === skorTertinggi);

    const hasil = document.getElementById("hasil");
    hasil.classList.remove("d-none");

    hasil.innerHTML = `
    <h5 class="mb-3">Skor Semua Paket</h5>
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
    ${skor.map((s, i) => {
        const p = paketList[s.index];
        return `
      <div class="col">
        <div class="card h-100 shadow-lg border-0 bg-light text-black">
          <div class="card-body">
            <h5 class="card-title fw-bold"># ${i + 1}</h5>
            <ul class="list-unstyled mb-3">
              <li><strong>Kuota:</strong> ${p.kuota} GB</li>
              <li><strong>Harga:</strong> Rp${formatRupiah(p.harga)}</li>
              <li><strong>Masa Aktif:</strong> ${p.masaAktif} hari</li>
              <li><strong>Keterangan:</strong> ${p.keterangan || '-'}</li>
            </ul>
            <span class="badge text-bg-dark">Skor: ${s.skor.toFixed(4)}</span>
          </div>
        </div>
      </div>
      `;
    }).join("")}
    </div >
    <button class="btn btn-danger fw-bold reset-btn mt-3" onclick="resetSemua()">Hapus Semua Data</button>
`;
}

function resetSemua() {
    paketList.length = 0;
    tampilkanTabel();
    document.getElementById("hasil").classList.add("d-none");
}

// Modal hapus
let indexUntukDihapus = null;
const modalHapus = document.getElementById("modalHapus");

modalHapus.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    indexUntukDihapus = parseInt(button.getAttribute("data-index"));
});

document.getElementById("btnKonfirmasiHapus").addEventListener("click", function () {
    if (indexUntukDihapus !== null) {
        paketList.splice(indexUntukDihapus, 1);
        tampilkanTabel();
        indexUntukDihapus = null;
        bootstrap.Modal.getInstance(modalHapus).hide();
        document.getElementById("hasil").classList.add("d-none");
    }
});
