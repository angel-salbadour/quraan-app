import type { AyahReciter, Reciter } from '../types/quran';

const ALL_SURAHS = Array.from({ length: 114 }, (_, i) => i + 1);

/**
 * Curated renowned reciters with verified MP3Quran servers.
 * Merged at runtime with the full 200+ reciters directory from mp3quran.net/api/v3/reciters?language=ar.
 */
export const FEATURED_RECITERS: Reciter[] = [
  {
    id: 'featured-afs',
    name: 'مشاري راشد العفاسي',
    country: 'الكويت',
    featured: true,
    moshafs: [
      { id: 1001, name: 'حفص عن عاصم - مرتل', server: 'https://server8.mp3quran.net/afs/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-basit',
    name: 'عبد الباسط عبد الصمد',
    country: 'مصر',
    featured: true,
    moshafs: [
      { id: 1002, name: 'حفص عن عاصم - مرتل', server: 'https://server7.mp3quran.net/basit/', surahTotal: 114, surahList: ALL_SURAHS },
      { id: 1003, name: 'حفص عن عاصم - المصحف المجود', server: 'https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/', surahTotal: 114, surahList: ALL_SURAHS },
      { id: 1004, name: 'ورش عن نافع', server: 'https://server7.mp3quran.net/basit/Rewayat-Warsh-A-n-Nafi/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-husr',
    name: 'محمود خليل الحصري',
    country: 'مصر',
    featured: true,
    moshafs: [
      { id: 1005, name: 'حفص عن عاصم - مرتل', server: 'https://server13.mp3quran.net/husr/', surahTotal: 114, surahList: ALL_SURAHS },
      { id: 1006, name: 'حفص عن عاصم - المصحف المجود', server: 'https://server13.mp3quran.net/husr/Almusshaf-Al-Mojawwad/', surahTotal: 114, surahList: ALL_SURAHS },
      { id: 1007, name: 'ورش عن نافع', server: 'https://server13.mp3quran.net/husr/Rewayat-Warsh-A-n-Nafi/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-minsh',
    name: 'محمد صديق المنشاوي',
    country: 'مصر',
    featured: true,
    moshafs: [
      { id: 1008, name: 'حفص عن عاصم - مرتل', server: 'https://server10.mp3quran.net/minsh/', surahTotal: 114, surahList: ALL_SURAHS },
      { id: 1009, name: 'حفص عن عاصم - المصحف المجود', server: 'https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-sds',
    name: 'عبد الرحمن السديس',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1010, name: 'حفص عن عاصم - مرتل', server: 'https://server11.mp3quran.net/sds/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-shur',
    name: 'سعود الشريم',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1011, name: 'حفص عن عاصم - مرتل', server: 'https://server7.mp3quran.net/shur/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-maher',
    name: 'ماهر المعيقلي',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1012, name: 'حفص عن عاصم - مرتل', server: 'https://server12.mp3quran.net/maher/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-yasser',
    name: 'ياسر الدوسري',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1013, name: 'حفص عن عاصم - مرتل', server: 'https://server11.mp3quran.net/yasser/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-s_gmd',
    name: 'سعد الغامدي',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1014, name: 'حفص عن عاصم - مرتل', server: 'https://server7.mp3quran.net/s_gmd/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-qtm',
    name: 'ناصر القطامي',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1015, name: 'حفص عن عاصم - مرتل', server: 'https://server6.mp3quran.net/qtm/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-ajm',
    name: 'أحمد بن علي العجمي',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1016, name: 'حفص عن عاصم - مرتل', server: 'https://server10.mp3quran.net/ajm/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-frs_a',
    name: 'فارس عباد',
    country: 'اليمن',
    featured: true,
    moshafs: [
      { id: 1017, name: 'حفص عن عاصم - مرتل', server: 'https://server8.mp3quran.net/frs_a/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-abkr',
    name: 'إدريس أبكر',
    country: 'اليمن',
    featured: true,
    moshafs: [
      { id: 1018, name: 'حفص عن عاصم - مرتل', server: 'https://server6.mp3quran.net/abkr/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-hthfi',
    name: 'علي بن عبد الرحمن الحذيفي',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1019, name: 'حفص عن عاصم - مرتل', server: 'https://server9.mp3quran.net/hthfi/', surahTotal: 114, surahList: ALL_SURAHS },
      { id: 1020, name: 'قالون عن نافع', server: 'https://server9.mp3quran.net/hthfi/Rewayat-Qalon-A-n-Nafi/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-ayyub',
    name: 'محمد أيوب',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1021, name: 'حفص عن عاصم - مرتل', server: 'https://server8.mp3quran.net/ayyub/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-a_jbr',
    name: 'علي جابر',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1022, name: 'حفص عن عاصم - مرتل', server: 'https://server11.mp3quran.net/a_jbr/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-bna',
    name: 'محمود علي البنا',
    country: 'مصر',
    featured: true,
    moshafs: [
      { id: 1023, name: 'حفص عن عاصم - مرتل', server: 'https://server8.mp3quran.net/bna/', surahTotal: 114, surahList: ALL_SURAHS },
      { id: 1024, name: 'حفص عن عاصم - المصحف المجود', server: 'https://server8.mp3quran.net/bna/Almusshaf-Al-Mojawwad/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-shatri',
    name: 'أبو بكر الشاطري',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1025, name: 'حفص عن عاصم - مرتل', server: 'https://server11.mp3quran.net/shatri/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-jleel',
    name: 'خالد الجليل',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1026, name: 'حفص عن عاصم - مرتل', server: 'https://server10.mp3quran.net/jleel/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-lhdan',
    name: 'محمد اللحيدان',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1027, name: 'حفص عن عاصم - مرتل', server: 'https://server8.mp3quran.net/lhdan/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-tblawi',
    name: 'محمد محمود الطبلاوي',
    country: 'مصر',
    featured: true,
    moshafs: [
      { id: 1028, name: 'حفص عن عاصم - مرتل', server: 'https://server12.mp3quran.net/tblawi/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-koshi',
    name: 'العيون الكوشي',
    country: 'المغرب',
    featured: true,
    moshafs: [
      { id: 1029, name: 'ورش عن نافع', server: 'https://server11.mp3quran.net/koshi/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-qazabri',
    name: 'عمر القزابري',
    country: 'المغرب',
    featured: true,
    moshafs: [
      { id: 1030, name: 'ورش عن نافع', server: 'https://server9.mp3quran.net/omar_warsh/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-yassin',
    name: 'ياسين الجزائري',
    country: 'الجزائر',
    featured: true,
    moshafs: [
      { id: 1031, name: 'ورش عن نافع', server: 'https://server11.mp3quran.net/qari/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-balushi',
    name: 'هزاع البلوشي',
    country: 'عمان',
    featured: true,
    moshafs: [
      { id: 1032, name: 'حفص عن عاصم - مرتل', server: 'https://server11.mp3quran.net/hazza/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-islam',
    name: 'إسلام صبحي',
    country: 'مصر',
    featured: true,
    moshafs: [
      { id: 1033, name: 'حفص عن عاصم - مرتل', server: 'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-jbrl',
    name: 'محمد جبريل',
    country: 'مصر',
    featured: true,
    moshafs: [
      { id: 1034, name: 'حفص عن عاصم - مرتل', server: 'https://server8.mp3quran.net/jbrl/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-hani',
    name: 'هاني الرفاعي',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1035, name: 'حفص عن عاصم - مرتل', server: 'https://server8.mp3quran.net/hani/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-bsfr',
    name: 'عبد الله بصفر',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1036, name: 'حفص عن عاصم - مرتل', server: 'https://server6.mp3quran.net/bsfr/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-jhn',
    name: 'عبد الله عواد الجهني',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1037, name: 'حفص عن عاصم - مرتل', server: 'https://server13.mp3quran.net/jhn/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-s_bud',
    name: 'صلاح البدير',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1038, name: 'حفص عن عاصم - مرتل', server: 'https://server6.mp3quran.net/s_bud/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-bu_khtr',
    name: 'صلاح بو خاطر',
    country: 'الإمارات',
    featured: true,
    moshafs: [
      { id: 1039, name: 'حفص عن عاصم - مرتل', server: 'https://server8.mp3quran.net/bu_khtr/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-baleela',
    name: 'بندر بليلة',
    country: 'السعودية',
    featured: true,
    moshafs: [
      { id: 1040, name: 'حفص عن عاصم - مرتل', server: 'https://server6.mp3quran.net/balilah/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-nufais',
    name: 'أحمد النفيس',
    country: 'الكويت',
    featured: true,
    moshafs: [
      { id: 1041, name: 'حفص عن عاصم - مرتل', server: 'https://server16.mp3quran.net/nufais/Rewayat-Hafs-A-n-Assem/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-mustafa',
    name: 'مصطفى إسماعيل',
    country: 'مصر',
    featured: true,
    moshafs: [
      { id: 1042, name: 'حفص عن عاصم - مرتل', server: 'https://server8.mp3quran.net/mustafa/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
  {
    id: 'featured-swaid',
    name: 'أيمن رشدي سويد',
    country: 'سوريا',
    featured: true,
    moshafs: [
      { id: 1043, name: 'حفص عن عاصم - مرتل', server: 'https://server12.mp3quran.net/swaid/', surahTotal: 114, surahList: ALL_SURAHS },
    ],
  },
];

/**
 * Verified verse-by-verse audio reciters for synchronized Ayah highlighting & Hifz repeat.
 */
export const AYAH_RECITERS: AyahReciter[] = [
  { id: 'ar.alafasy', name: 'مشاري راشد العفاسي', style: 'مرتل', bitrate: 128 },
  { id: 'ar.husary', name: 'محمود خليل الحصري', style: 'مرتل', bitrate: 128 },
  { id: 'ar.husarymujawwad', name: 'محمود خليل الحصري', style: 'مجود', bitrate: 128 },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد', style: 'مرتل', bitrate: 192 },
  { id: 'ar.abdulsamad', name: 'عبد الباسط عبد الصمد', style: 'مجود', bitrate: 64 },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', style: 'مرتل', bitrate: 128 },
  { id: 'ar.minshawimujawwad', name: 'محمد صديق المنشاوي', style: 'مجود', bitrate: 64 },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', style: 'مرتل', bitrate: 128 },
  { id: 'ar.abdurrahmaansudais', name: 'عبد الرحمن السديس', style: 'مرتل', bitrate: 192 },
  { id: 'ar.saoodshuraym', name: 'سعود الشريم', style: 'مرتل', bitrate: 64 },
  { id: 'ar.ahmedajamy', name: 'أحمد بن علي العجمي', style: 'مرتل', bitrate: 128 },
  { id: 'ar.hudhaify', name: 'علي الحذيفي', style: 'مرتل', bitrate: 128 },
  { id: 'ar.shaatree', name: 'أبو بكر الشاطري', style: 'مرتل', bitrate: 128 },
  { id: 'ar.muhammadayyoub', name: 'محمد أيوب', style: 'مرتل', bitrate: 128 },
  { id: 'ar.muhammadjibreel', name: 'محمد جبريل', style: 'مرتل', bitrate: 128 },
  { id: 'ar.hanirifai', name: 'هاني الرفاعي', style: 'مرتل', bitrate: 192 },
  { id: 'ar.abdullahbasfar', name: 'عبد الله بصفر', style: 'مرتل', bitrate: 192 },
  { id: 'ar.aymanswoaid', name: 'أيمن سويد', style: 'مرتل تعليمي', bitrate: 64 },
];
