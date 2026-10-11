// Data Skema Kuesioner Hubungan Serius (11 Bagian)
const FORM_SECTIONS = [
  {
    id: 'sec_1',
    number: 1,
    title: 'Personal Information',
    subtitle: 'Data Diri Kandidat',
    description: 'Kenalan lebih dekat dengan identitas dan latar belakang utamamu.',
    questions: [
      {
        id: 's1_q1',
        title: 'Nama Lengkap & Nama Panggilan',
        type: 'text',
        required: true,
        placeholder: 'Contoh: Dimas Aditya (Adit)',
        hint: 'Tulis nama lengkap beserta nama panggilan yang biasa digunakan.'
      },
      {
        id: 's1_q2',
        title: 'Usia / Tanggal Lahir',
        type: 'text',
        required: true,
        placeholder: 'Contoh: 26 tahun / 15 Mei 1999',
        hint: 'Tuliskan usia saat ini dan tanggal lahir lengkap.'
      },
      {
        id: 's1_q3',
        title: 'Domisili Saat Ini & Asal Kota',
        type: 'text',
        required: true,
        placeholder: 'Contoh: Jakarta Selatan (Asal: Bandung)',
        hint: 'Kota tempat tinggal sekarang dan kota asal keluargamu.'
      },
      {
        id: 's1_q4',
        title: 'Pekerjaan / Jabatan & Industri',
        type: 'text',
        required: true,
        placeholder: 'Contoh: Senior Product Designer, Tech Industry',
        hint: 'Profesi, posisi saat ini, dan bidang industri tempatmu berkarya.'
      },
      {
        id: 's1_q5',
        title: 'Akun Media Sosial Utama (Instagram / LinkedIn)',
        type: 'text',
        required: false,
        placeholder: 'Contoh: @dimasaditya / linkedin.com/in/dimas',
        hint: 'Tautan atau username profil sosial media utamamu.'
      },
      {
        id: 's1_q6',
        title: 'Status Hubungan Saat Ini',
        type: 'radio_other',
        required: true,
        options: [
          { value: 'Single / Lajang', label: 'Single / Lajang' },
          { value: 'Pernah Menikah', label: 'Pernah Menikah' },
          { value: 'other', label: 'Lainnya...', hasInput: true, placeholder: 'Sebutkan statusmu saat ini...' }
        ]
      },
      {
        id: 's1_q7',
        title: 'Punya anak dari hubungan sebelumnya?',
        type: 'radio_other',
        required: true,
        options: [
          { value: 'Tidak', label: 'Tidak' },
          { value: 'Ya', label: 'Ya', hasInput: true, placeholder: 'Berapa orang anak?' }
        ]
      }
    ]
  },
  {
    id: 'sec_2',
    number: 2,
    title: 'Relationship History & Readiness',
    subtitle: 'Riwayat Hubungan & Kesiapan Hati',
    description: 'Masa lalu adalah pelajaran, sedangkan masa depan butuh kesiapan yang nyata.',
    questions: [
      {
        id: 's2_q1',
        title: 'Berapa lama kamu melajang dan apakah kamu sudah benar-benar move on dari masa lalu?',
        type: 'textarea',
        required: true,
        placeholder: 'Ceritakan dengan jujur proses penerimaan dan kesiapan hatimu saat ini...',
        hint: 'Jawab dengan esai reflektif.'
      },
      {
        id: 's2_q2',
        title: 'Seberapa siap kamu melangkah ke jenjang pernikahan yang serius?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Sangat Siap & Niat Kuat', label: 'Sangat Siap & Niat Kuat' },
          { value: 'Siap Menuju Proses Taaruf/Lamaran', label: 'Siap Menuju Proses Taaruf / Lamaran' },
          { 
            value: 'Masih Ragu-ragu (Otomatis Ditolak)', 
            label: 'Masih Ragu-ragu (Otomatis Ditolak)',
            isFlag: true,
            flagMessage: 'Kandidat masih ragu melangkah serius.'
          }
        ]
      },
      {
        id: 's2_q3',
        title: 'Apa pelajaran terbesar dari hubungan masa lalumu yang membuatmu menjadi pria yang lebih matang?',
        type: 'textarea',
        required: true,
        placeholder: 'Tuliskan insight dan pendewasaan diri yang kamu dapatkan...',
        hint: 'Jawab dengan esai.'
      }
    ]
  },
  {
    id: 'sec_3',
    number: 3,
    title: 'Character, Values & Emotional Intelligence',
    subtitle: 'Karakter, Prinsip & Kecerdasan Emosional',
    description: 'Bagaimana kamu merespons emosi dan memegang teguh prinsip hidupmu.',
    questions: [
      {
        id: 's3_q1',
        title: 'Prinsip hidup atau nilai moral utama apa yang paling kamu pegang teguh?',
        type: 'textarea',
        required: true,
        placeholder: 'Contoh: integritas, kejujuran, tanggung jawab keluarga...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's3_q2',
        title: 'Bagaimana caramu berkomunikasi secara sehat ketika sedang menghadapi masalah atau salah paham?',
        type: 'textarea',
        required: true,
        placeholder: 'Bagaimana gayamu dalam mendinginkan suasana dan berdiskusi mencari titik temu...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's3_q3',
        title: 'Saat pasanganmu sedang ngambek atau emosi, apa reaksi utamamu?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Mendengarkan & memeluk', label: 'Mendengarkan & memeluk' },
          { value: 'Mencari solusi Bersama', label: 'Mencari solusi Bersama' },
          { 
            value: 'Ikut emosi / nge-gas', 
            label: 'Ikut emosi / nge-gas',
            isFlag: true,
            flagMessage: 'Kandidat cenderung reaktif/mudah terpancing saat konflik.'
          },
          { 
            value: 'Ngilang / diam berhari-hari', 
            label: 'Ngilang / diam berhari-hari',
            isFlag: true,
            flagMessage: 'Kandidat melakukan silent treatment berkepanjangan.'
          }
        ]
      },
      {
        id: 's3_q4',
        title: 'Bagaimana caramu menunjukkan konsistensi kasih sayang dan rasa aman kepada pasangan?',
        type: 'textarea',
        required: true,
        placeholder: 'Tindakan atau kebiasaan nyata yang kamu lakukan agar pasangan merasa terlindungi dan dihargai...',
        hint: 'Jawab dengan esai.'
      }
    ]
  },
  {
    id: 'sec_4',
    number: 4,
    title: 'Communication & Conflict Resolution',
    subtitle: 'Komunikasi & Penyelesaian Masalah',
    description: 'Kedewasaan sebuah hubungan diuji dari cara menyelesaikan perselisihan.',
    questions: [
      {
        id: 's4_q1',
        title: 'Bagaimana caramu menyampaikan ketidaknyamanan tanpa menyakiti perasaan pasangan?',
        type: 'textarea',
        required: true,
        placeholder: 'Jelaskan cara kamu menyampaikan kritik atau uneg-uneg secara elegan...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's4_q2',
        title: 'Apakah kamu bisa meminta maaf lebih dulu meskipun kamu merasa tidak sepenuhnya salah?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Selalu bisa demi keharmonisan', label: 'Selalu bisa demi keharmonisan' },
          { value: 'Tergantung mood', label: 'Tergantung mood' },
          { 
            value: 'Gengsi tinggi (Harus dibujuk)', 
            label: 'Gengsi tinggi (Harus dibujuk)',
            isFlag: true,
            flagMessage: 'Gengsi tinggi dalam meminta maaf.'
          }
        ]
      },
      {
        id: 's4_q3',
        title: 'Apa komitmenmu agar komunikasi tetap terbuka dan tidak melakukan silent treatment saat bertengkar?',
        type: 'textarea',
        required: true,
        placeholder: 'Aturan main atau komitmen pribadi yang kamu terapkan...',
        hint: 'Jawab dengan esai.'
      }
    ]
  },
  {
    id: 'sec_5',
    number: 5,
    title: 'Financial & Provider Mindset',
    subtitle: 'Finansial & Pola Pikir Nafkah',
    description: 'Kesiapan bertanggung jawab dan visi pengelolaan rezeki masa depan bersama.',
    questions: [
      {
        id: 's5_q1',
        title: 'Status Stabilitas & Manajemen Finansial:',
        type: 'radio',
        required: true,
        options: [
          { value: 'Stabil, Mandiri & Mapan', label: 'Stabil, Mandiri & Mapan' },
          { value: 'Berprogres / Bekerja Keras', label: 'Berprogres / Bekerja Keras' },
          { value: 'Butuh Motivasi & Perbaikan', label: 'Butuh Motivasi & Perbaikan' }
        ]
      },
      {
        id: 's5_q2',
        title: 'Bagaimana pandanganmu mengenai peran pencari nafkah dan pengelolaan keuangan rumah tangga?',
        type: 'textarea',
        required: true,
        placeholder: 'Tuliskan prinsipmu mengenai arus kas keluarga, tabungan masa depan, dan alokasi keuangan...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's5_q3',
        title: 'Apakah kamu siap bertanggung jawab penuh atas kebutuhan finansial keluarga?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Selalu Siap Sepenuhnya', label: 'Selalu Siap Sepenuhnya' },
          { value: 'Sebagian Besar / Kolaborasi', label: 'Sebagian Besar / Kolaborasi' },
          { value: 'Prinsip 50/50 Murni', label: 'Prinsip 50/50 Murni' }
        ]
      }
    ]
  },
  {
    id: 'sec_6',
    number: 6,
    title: 'Lifestyle, Vision & Future Family',
    subtitle: 'Gaya Hidup, Visi & Keluarga Masa Depan',
    description: 'Menyelaraskan arah kompas hidup, nilai spiritual, dan bahasa cinta.',
    questions: [
      {
        id: 's6_q1',
        title: 'Di mana kamu melihat visi hidup kita bersama dalam 5 tahun ke depan?',
        type: 'textarea',
        required: true,
        placeholder: 'Gambarkan pencapaian, tempat tinggal, dan suasana rumah tangga yang kamu impikan...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's6_q2',
        title: 'Bagaimana pandanganmu tentang peran keluarga besar, pengasuhan anak, dan nilai spiritual dalam rumah tangga?',
        type: 'textarea',
        required: true,
        placeholder: 'Batasan dengan mertua/keluarga besar, pola asuh anak yang diinginkan, dan pondasi ibadah...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's6_q3',
        title: 'Apa Love Language utamamu dalam mengekspresikan cinta?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Words of Affirmation', label: 'Words of Affirmation (Kata-kata pujian & apresiasi)' },
          { value: 'Quality Time', label: 'Quality Time (Waktu berkualitas berdua tanpa distraksi)' },
          { value: 'Acts of Service', label: 'Acts of Service (Tindakan nyata & bantuan meringankan beban)' },
          { value: 'Physical Touch', label: 'Physical Touch (Sentuhan fisik, pelukan & kedekatan hangat)' },
          { value: 'Gifts', label: 'Gifts (Hadiah bermakna & kejutan perhatian)' }
        ]
      }
    ]
  },
  {
    id: 'sec_7',
    number: 7,
    title: 'Red Flag Disclosure',
    subtitle: 'Keterbukaan Titik Lemah & Integritas',
    description: 'Ruang kejujuran mutlak untuk membicarakan kekurangan dan batasan moral.',
    questions: [
      {
        id: 's7_q1',
        title: 'Jawab dengan jujur: Apa kekurangan terbesar atau "red flag" dalam dirimu yang sedang kamu perbaiki?',
        type: 'textarea',
        required: true,
        placeholder: 'Sisi rapuh atau kebiasaan buruk yang sedang aktif kamu benahi demi menjadi pasangan yang lebih baik...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's7_q2',
        title: 'Pernah atau suka berbohong dalam hubungan?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Tidak Pernah', label: 'Tidak Pernah' },
          { value: 'Kadang-kadang', label: 'Kadang-kadang (akan dijelaskan)' },
          { 
            value: 'Semua orang pernah (Langsung Gugur)', 
            label: 'Semua orang pernah (Langsung Gugur)',
            isFlag: true,
            flagMessage: 'Meremehkan ketidakjujuran dalam komitmen.'
          }
        ]
      },
      {
        id: 's7_q3',
        title: 'Komitmen kesetiaan mutlak terhadap pasangan:',
        type: 'radio',
        required: true,
        options: [
          { value: 'Setia & Menjaga Kepercayaan', label: 'Setia & Menjaga Kepercayaan' },
          { 
            value: 'Suka Genit / Chat Rahasia', 
            label: 'Suka Genit / Chat Rahasia',
            isFlag: true,
            flagMessage: 'Memiliki riwayat atau kecenderungan chat rahasia di luar batas.'
          },
          { 
            value: 'Open Relationship (Gugur Total)', 
            label: 'Open Relationship (Gugur Total)',
            isFlag: true,
            flagMessage: 'Menginginkan hubungan terbuka / tidak berkomitmen eksklusif.'
          }
        ]
      }
    ]
  },
  {
    id: 'sec_8',
    number: 8,
    title: 'Courtship & Dating Style',
    subtitle: 'Gaya Kencan & Merawat Romantisme',
    description: 'Keseriusan dalam mengusahakan hubungan dan menjaga hangatnya cinta.',
    questions: [
      {
        id: 's8_q1',
        title: 'Apa arti "Intentional Dating" atau pendekatan serius yang bermakna bagimu?',
        type: 'textarea',
        required: true,
        placeholder: 'Bagaimana kamu membedakan kencan main-main dengan kencan yang bertujuan masa depan...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's8_q2',
        title: 'Bagaimana biasanya kamu merencanakan kencan berkualitas bersama pasangan?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Booking tempat nyaman sesuai kesukaan', label: 'Booking tempat nyaman sesuai kesukaan pasangan' },
          { value: 'Tanya detail sampai pasangan yang atur', label: 'Tanya detail sampai pasangan yang atur' },
          { value: "Bilang 'Terserah kamu, aku ngikut'", label: "Bilang 'Terserah kamu, aku ngikut'" }
        ]
      },
      {
        id: 's8_q3',
        title: 'Bagaimana caramu menjaga romantisme agar hubungan tetap hangat setelah menikah nanti?',
        type: 'textarea',
        required: true,
        placeholder: 'Kebiasaan kencan rutin, kata-kata manis, kejutan kecil, atau liburan bersama...',
        hint: 'Jawab dengan esai.'
      }
    ]
  },
  {
    id: 'sec_9',
    number: 9,
    title: 'Household & Domestic Responsibility',
    subtitle: 'Tanggung Jawab Domestik & Rumah Tangga',
    description: 'Kemitraan nyata dalam mengurus rumah dan meringankan lelah satu sama lain.',
    questions: [
      {
        id: 's9_q1',
        title: 'Sejauh apa keterlibatanmu dalam pekerjaan rumah tangga?',
        type: 'textarea',
        required: true,
        placeholder: 'Memasak, mencuci, beres-beres rumah, atau tugas sehari-hari lainnya yang biasa kamu lakukan...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's9_q2',
        title: 'Pandanganmu mengenai pembagian tugas domestik suami dan istri:',
        type: 'radio',
        required: true,
        options: [
          { value: 'Saling bantu tanpa batas peran kaku', label: 'Saling bantu tanpa batas peran kaku' },
          { value: 'Tergantung kesepakatan fleksibel berdua', label: 'Tergantung kesepakatan fleksibel berdua' },
          { value: 'Suami cari uang, istri urus rumah', label: 'Suami cari uang, istri urus rumah' }
        ]
      },
      {
        id: 's9_q3',
        title: 'Bagaimana caramu menjadi sosok partner yang meringankan beban mental pasangan di rumah?',
        type: 'textarea',
        required: true,
        placeholder: 'Contoh inisiatif tanpa perlu disuruh, peka terhadap kelelahan pasangan, dll...',
        hint: 'Jawab dengan esai.'
      }
    ]
  },
  {
    id: 'sec_10',
    number: 10,
    title: 'Jealousy, Trust & Boundaries',
    subtitle: 'Kecemburuan, Kepercayaan & Batasan',
    description: 'Menjaga batas kehormatan dari pihak luar dan kenyamanan privasi digital.',
    questions: [
      {
        id: 's10_q1',
        title: 'Seberapa pencemburu kamu dalam skala kewajaran?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Sangat Percaya & Tenang', label: 'Sangat Percaya & Tenang' },
          { value: 'Cukup Wajar & Terbuka', label: 'Cukup Wajar & Terbuka' },
          { 
            value: 'Pencemburu / Protektif Berlebihan', 
            label: 'Pencemburu / Protektif Berlebihan',
            isFlag: true,
            flagMessage: 'Kecenderungan protektif atau cemburu berlebihan.'
          }
        ]
      },
      {
        id: 's10_q2',
        title: 'Batasan apa saja yang kamu tetapkan untuk menjaga kehormatan hubungan dari pihak luar?',
        type: 'textarea',
        required: true,
        placeholder: 'Batasan berinteraksi dengan lawan jenis, rekan kerja, mantan, atau di media sosial...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's10_q3',
        title: 'Apakah kamu transparan dan terbuka mengenai privasi digital (HP/Sosmed) kepada pasangan?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Ya, boleh dilihat kapan saja', label: 'Ya, boleh dilihat kapan saja' },
          { value: 'Tergantung alasan yang jelas', label: 'Tergantung alasan yang jelas (tetap saling respek)' },
          { 
            value: 'Tidak nyaman / Ada yang disembunyikan', 
            label: 'Tidak nyaman / Ada yang disembunyikan',
            isFlag: true,
            flagMessage: 'Merasa ada yang perlu disembunyikan dari privasi digital.'
          }
        ]
      }
    ]
  },
  {
    id: 'sec_11',
    number: 11,
    title: 'Intentions & Future Commitment',
    subtitle: 'Niat Tulus & Komitmen Seumur Hidup',
    description: 'Keputusan sadar untuk saling memilih dan memperjuangkan hari esok bersama.',
    questions: [
      {
        id: 's11_q1',
        title: 'Apa arti komitmen pernikahan seumur hidup bagimu secara mendalam?',
        type: 'textarea',
        required: true,
        placeholder: 'Bagikan pemahamanmu tentang janji suci dan kesetiaan melewati suka maupun duka...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's11_q2',
        title: 'Bagaimana cara konsisten yang akan kamu lakukan untuk "memilih" pasanganmu setiap hari?',
        type: 'textarea',
        required: true,
        placeholder: 'Saat fase jatuh cinta mulai tergantikan oleh rutinitas, apa upayamu untuk terus jatuh cinta...',
        hint: 'Jawab dengan esai.'
      },
      {
        id: 's11_q3',
        title: 'Siapkah kamu berkomitmen penuh secara lahir batin untuk masa depan bersama?',
        type: 'radio',
        required: true,
        options: [
          { value: 'Siap Penuh & Bulat', label: 'Siap Penuh & Bulat' },
          { value: 'Butuh Pertimbangan Waktu', label: 'Butuh Pertimbangan Waktu' },
          { 
            value: 'Belum Tahu Pasti', 
            label: 'Belum Tahu Pasti',
            isFlag: true,
            flagMessage: 'Belum memiliki kepastian komitmen lahir batin.'
          }
        ]
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FORM_SECTIONS;
}
