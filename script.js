const paketList = [];

const atribut = {
    kuota: { bobot: 1 / 3, jenis: "benefit" },
    harga: { bobot: 1 / 3, jenis: "cost" },
    masaAktif: { bobot: 1 / 3, jenis: "benefit" }
};

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
    const harga = parseFloat(document.getElementById("harga").value);
    const masaAktif = parseFloat(document.getElementById("masaAktif").value);
    const noTelp = document.getElementById("noTelp").value.trim();

    if (isNaN(kuota) || isNaN(harga) || isNaN(masaAktif) || harga <= 0) {
        showError("Mohon isi semua data dengan benar dan harga tidak boleh 0.");
        return;
    }

    paketList.push({ kuota, harga, masaAktif, noTelp });
    tampilkanTabel();

    document.getElementById("kuota").value = "";
    document.getElementById("harga").value = "";
    document.getElementById("masaAktif").value = "";
    document.getElementById("noTelp").value = "";
}

function tampilkanTabel() {
    const tbody = document.querySelector("#tabelPaket tbody");
    tbody.innerHTML = "";
    paketList.forEach((paket, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${paket.kuota}</td>
            <td>${paket.harga}</td>
            <td>${paket.masaAktif}</td>
            <td>${paket.noTelp || '-'}</td>
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
        return {
            index: v.index,
            skor: dMin / (dPlus + dMin)
        };
    });

    skor.sort((a, b) => b.skor - a.skor);

    const hasil = document.getElementById("hasil");
    hasil.classList.remove("d-none");
    hasil.innerHTML = `<h5 class="mb-2">📊 Skor Semua Paket:</h5><ol>` +
        skor.map(s => {
            const p = paketList[s.index];
            return `<li>Kuota ${p.kuota}GB, Harga Rp${p.harga}, Masa Aktif ${p.masaAktif} hari, No. Telp: ${p.noTelp || '-'}, (Skor: ${s.skor.toFixed(5)})</li>`;
        }).join("") +
        `</ol><strong>✅ Paket Terbaik:</strong> <br>Kuota ${paketList[skor[0].index].kuota}GB, Harga Rp${paketList[skor[0].index].harga}, Masa Aktif ${paketList[skor[0].index].masaAktif} hari, No. Telp: ${paketList[skor[0].index].noTelp || '-'} (Skor: ${skor[0].skor.toFixed(5)})`;
}
