export const GROUPS = [
  {
    id: 'respons', number: '01', title: 'Respons & kecepatan', subtitle: 'Pengalaman saat meminta bantuan IT', icon: 'clock',
    questions: [
      ['r1', 'Kecepatan tim IT merespons laporan atau permintaan bantuan'],
      ['r2', 'Waktu yang dibutuhkan untuk menyelesaikan permasalahan'],
      ['r3', 'Kemudahan menghubungi tim IT saat dibutuhkan']
    ]
  },
  {
    id: 'solusi', number: '02', title: 'Kualitas solusi', subtitle: 'Ketepatan identifikasi dan penanganan masalah', icon: 'tool',
    questions: [
      ['s1', 'Kemampuan tim IT mengidentifikasi penyebab permasalahan'],
      ['s2', 'Kualitas hasil penyelesaian masalah yang diberikan'],
      ['s3', 'Kejelasan penjelasan atau panduan setelah penanganan']
    ]
  },
  {
    id: 'profesional', number: '03', title: 'Sikap & profesionalisme', subtitle: 'Kenyamanan selama berinteraksi dengan tim IT', icon: 'users',
    questions: [
      ['p1', 'Keramahan dan kesopanan petugas IT'],
      ['p2', 'Kejelasan komunikasi selama proses penanganan'],
      ['p3', 'Tindak lanjut tim IT sampai permasalahan selesai']
    ]
  },
  {
    id: 'infrastruktur', number: '04', title: 'Infrastruktur & perangkat', subtitle: 'Konektivitas dan dukungan perangkat kerja', icon: 'wifi',
    questions: [
      ['i1', 'Kualitas dan kestabilan internet / Wi-Fi di area kerja'],
      ['i2', 'Dukungan teknis komputer dan laptop'],
      ['i3', 'Penanganan gangguan jaringan dan konektivitas'],
      ['i4', 'Dukungan teknis CCTV dan perangkat IT lainnya']
    ]
  },
  {
    id: 'aplikasi', number: '05', title: 'Aplikasi & akses sistem', subtitle: 'Aplikasi internal dan akun pengguna', icon: 'monitor',
    questions: [
      ['a1', 'Kemudahan penggunaan aplikasi atau sistem internal perusahaan'],
      ['a2', 'Penanganan kendala pada aplikasi atau sistem internal'],
      ['a3', 'Pengelolaan akun, akses sistem, dan kebutuhan IT lainnya']
    ]
  },
  {
    id: 'teknologi', number: '06', title: 'Teknologi', subtitle: 'Penerapan dan pengembangan teknologi PT SJR', icon: 'spark',
    questions: [
      ['t1', 'Bagaimana tingkat kepuasan Anda terhadap penerapan teknologi PT SJR?'],
      ['t2', 'Menurut Anda, teknologi apa yang perlu dikembangkan di departemen Anda?', 'text']
    ]
  },
  {
    id: 'optimasi', number: '07', title: 'Optimasi', subtitle: 'Dukungan data, informasi, dan optimalisasi oleh Departemen IOT', icon: 'chart',
    questions: [
      ['o1', 'Bagaimana dukungan Departemen IOT dalam delivery data/informasi?'],
      ['o2', 'Bagaimana respons Departemen IOT dalam delivery data atau kebutuhan departemen terkait?'],
      ['o3', 'Optimasi apa di departemen Anda yang dapat diberikan oleh Departemen IOT?', 'text'],
      ['o4', 'Bagaimana tingkat kepuasan Anda terhadap Departemen IOT dalam delivery data/informasi?']
    ]
  }
];

export const QUESTION_IDS = GROUPS.flatMap(group => group.questions.filter(q => q[2] !== 'text').map(item => item[0]));
export const OPEN_QUESTION_IDS = GROUPS.flatMap(group => group.questions.filter(q => q[2] === 'text').map(item => item[0]));
export const DEPARTMENTS = ['DEPT HCGS', 'DEPT SHE', 'DEPT MET', 'DEPT PCM', 'DEPT GEE', 'DEPT MSM', 'DEPT CSR', 'DEPT FAC', 'DEPT CPMD', 'DEPT IOT', 'DEPT COLE', 'Lainnya'];
export const LOCATIONS = ['HO', 'SITE'];

export const PRIORITIES = [
  'Kecepatan respons dan penanganan',
  'Kualitas jaringan internet / Wi-Fi',
  'Komputer, laptop, dan printer',
  'Aplikasi dan sistem internal',
  'Komunikasi dan koordinasi tim IT',
  'CCTV dan perangkat pendukung',
  'Pelayanan Optimalisasi',
  'Penerapan Teknologi',
  'Lainnya'
];

export const SUPPORT_OPTIONS = ['Sangat Mendukung', 'Mendukung', 'Cukup Mendukung', 'Kurang Mendukung', 'Tidak Mendukung'];
export const RATING_LABELS = ['Sangat Tidak Puas', 'Tidak Puas', 'Cukup Puas', 'Puas', 'Puas Sekali', 'Sangat Puas'];
export const ICONS = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  tool: '<path d="M14.5 6.3a5 5 0 0 0-6.2 6.2L3 17.8 6.2 21l5.3-5.3a5 5 0 0 0 6.2-6.2L14 12l-2-2 2.5-3.7Z"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 11a3 3 0 1 0 0-6M17 14a5 5 0 0 1 4 5v1"/>',
  wifi: '<path d="M2 8.7a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>',
  monitor: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8M12 18v4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  arrowleft: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  chart: '<path d="M3 3v18h18M7 16v-5m5 5V7m5 9V4"/>',
  spark: '<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2ZM19 17l.6 2.4L22 20l-2.4.6L19 23l-.6-2.4L16 20l2.4-.6L19 17Z"/>',
  lock: '<rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
};
export const icon = (name, size=18) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.check}</svg>`;
