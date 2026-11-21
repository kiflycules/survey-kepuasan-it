
/* FITUR PILIH SEMUA DAN HAPUS TERPILIH */
const pilihanHapus = new Map();
const renderTableAsli = renderTable;

renderTable = function () {
  renderTableAsli();
  pilihanHapus.clear();

  const tabel = document.querySelector('.responses-table');
  const judul = tabel?.closest('.table-section')
    ?.querySelector('.data-card-head');
  const kepala = tabel?.querySelector('thead tr');

  if (!tabel || !kepala) return;

  if (!document.getElementById('pilihSemuaJawaban')) {
    kepala.insertAdjacentHTML(
      'afterbegin',
      '<th><label style="white-space:nowrap"><input type="checkbox" id="pilihSemuaJawaban"> Semua</label></th>'
    );
  }

  document.querySelectorAll('#responseRows tr').forEach((tr, i) => {
    const r = rows[i];

    if (!r) {
      tr.querySelector('td')?.setAttribute('colspan', '8');
    } else if (r.id && r.created_at) {
      tr.insertAdjacentHTML(
        'afterbegin',
        `<td><input type="checkbox" class="pilihJawaban"
          data-index="${i}" aria-label="Pilih jawaban ${i + 1}"></td>`
      );
    } else {
      tr.insertAdjacentHTML('afterbegin', '<td>—</td>');
    }
  });

  if (judul && !document.getElementById('hapusTerpilih')) {
    const tombol = document.createElement('button');
    tombol.id = 'hapusTerpilih';
    tombol.type = 'button';
    tombol.className = 'btn btn-outline';
    tombol.style.cssText =
      'border-color:#dd8888;color:#a83232;padding:9px 14px;white-space:nowrap';
    tombol.addEventListener('click', hapusBanyakJawaban);
    judul.appendChild(tombol);
  }

  perbaruiTombolHapus();
};

function perbaruiTombolHapus() {
  const tombol = document.getElementById('hapusTerpilih');

  if (tombol) {
    tombol.textContent = `Hapus Terpilih (${pilihanHapus.size})`;
    tombol.disabled = !pilihanHapus.size || loading;
  }

  const semua = document.getElementById('pilihSemuaJawaban');

  if (semua) {
    const eligible = rows.filter(r => r?.id && r?.created_at);
    semua.checked = eligible.length > 0 &&
      eligible.every(r => pilihanHapus.has(r.id));
    semua.indeterminate =
      pilihanHapus.size > 0 && !semua.checked;
  }
}

document.querySelector('.responses-table thead')
  ?.addEventListener('change', event => {
    if (event.target.id !== 'pilihSemuaJawaban') return;

    if (event.target.checked && truncated) {
      alert('Hasil terlalu banyak. Gunakan filter periode atau departemen terlebih dahulu.');
      event.target.checked = false;
      perbaruiTombolHapus();
      return;
    }

    pilihanHapus.clear();

    if (event.target.checked) {
      rows.filter(r => r?.id && r?.created_at).forEach(r => {
        pilihanHapus.set(r.id, {
          id: r.id,
          created_at: r.created_at
        });
      });
    }

    document.querySelectorAll('.pilihJawaban').forEach(cb => {
      cb.checked = event.target.checked;
    });

    perbaruiTombolHapus();
  });

$('responseRows').addEventListener('change', event => {
  if (!event.target.classList.contains('pilihJawaban')) return;

  const r = rows[Number(event.target.dataset.index)];
  if (!r?.id || !r.created_at) return;

  if (event.target.checked) {
    pilihanHapus.set(r.id, {
      id: r.id,
      created_at: r.created_at
    });
  } else {
    pilihanHapus.delete(r.id);
  }

  perbaruiTombolHapus();
});

async function hapusBanyakJawaban() {
  if (loading || !pilihanHapus.size) return;

  const daftar = [...pilihanHapus.values()];
  const perintah = `HAPUS ${daftar.length}`;

  const jawaban = window.prompt(
    `Kamu akan menghapus permanen ${daftar.length} jawaban.\n` +
    `Data tidak dapat dikembalikan.\n\n` +
    `Ketik ${perintah} untuk melanjutkan:`
  );

  if (jawaban !== perintah) return;

  const tombol = document.getElementById('hapusTerpilih');
  if (tombol) tombol.disabled = true;

  let berhasil = 0;
  let gagal = 0;

  for (let i = 0; i < daftar.length; i += 5) {
    const batch = daftar.slice(i, i + 5);

    const hasil = await Promise.allSettled(
      batch.map(r => requestAdmin('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-response',
          id: r.id,
          created_at: r.created_at
        })
      }))
    );

    hasil.forEach(x => {
      if (x.status === 'fulfilled') berhasil++;
      else gagal++;
    });

    if (tombol) {
      tombol.textContent =
        `Menghapus ${Math.min(i + 5, daftar.length)}/${daftar.length}...`;
    }
  }

  await loadData();

  notice(
    `${berhasil} jawaban berhasil dihapus.` +
    (gagal ? ` ${gagal} gagal; periksa data tersisa.` : '')
  );
}
