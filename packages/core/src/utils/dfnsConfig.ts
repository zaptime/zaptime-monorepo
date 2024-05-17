import DfnsConfig from '../types/DfnsConfig';

// const languages = [
// 'af',
// 'arDZ',
// 'arMA',
// 'arSA',
// 'az',
// 'be',
// 'bg',
// 'bn',
// 'ca',
// "cs",
// 'cy',
// 'da',
// 'de',
// 'el',
// 'enAU',
// 'enCA',
// 'enGB',
// 'enIN',
// 'enNZ',
// 'enUS',
// 'enZA',
// 'eo',
// 'es',
// 'et',
// 'eu',
// 'faIR',
// 'fi',
// 'fr',
// 'frCA',
// 'frCH',
// 'gd',
// 'gl',
// 'gu',
// 'he',
// 'hi',
// 'hr',
// 'hu',
// 'hy',
// 'id',
// 'is',
// 'it',
// 'ja',
// 'ka',
// 'kk',
// 'kn',
// 'ko',
// 'lb',
// 'lt',
// 'lv',
// 'mk',
// 'ms',
// 'mt',
// 'nb',
// 'nl',
// 'nlBE',
// 'nn',
// 'pl',
// 'pt',
// 'ptBR',
// 'ro',
// 'ru',
// 'sk',
// 'sl',
// 'sr',
// 'srLatn',
// 'sv',
// 'ta',
// 'te',
// 'th',
// 'tr',
// 'ug',
// 'uk',
// 'uz',
// 'vi',
// 'zhCN',
// 'zhTW',
// ];

export const getDfnsConfig = async (locale: string): Promise<DfnsConfig> => {
  let dateFnsLocale = undefined;

  if (locale === undefined) {
    dateFnsLocale = await import('date-fns/locale/en-US');
    const dfnsConf: DfnsConfig = {
      locale: dateFnsLocale.default,
    };

    return dfnsConf;
  }

  if (locale === 'cs') {
    dateFnsLocale = await import('date-fns/locale/cs');
  } else if (locale === 'sk') {
    dateFnsLocale = await import('date-fns/locale/sk');
  } else if (locale === 'pl') {
    dateFnsLocale = await import('date-fns/locale/pl');
  } else if (locale === 'de') {
    dateFnsLocale = await import('date-fns/locale/de');
  } else if (locale === 'pt') {
    dateFnsLocale = await import('date-fns/locale/pt');
  } else if (locale === 'es') {
    dateFnsLocale = await import('date-fns/locale/es');
  } else if (locale === 'ja') {
    dateFnsLocale = await import('date-fns/locale/ja');
  } else if (locale === 'zh') {
    dateFnsLocale = await import('date-fns/locale/zh-CN');
  } else if (locale === 'tr') {
    dateFnsLocale = await import('date-fns/locale/tr');
  } else if (locale === 'sv') {
    dateFnsLocale = await import('date-fns/locale/sv');
  } else if (locale === 'nl') {
    dateFnsLocale = await import('date-fns/locale/nl');
  } else if (locale === 'it') {
    dateFnsLocale = await import('date-fns/locale/it');
  } else if (locale === 'fi') {
    dateFnsLocale = await import('date-fns/locale/fi');
  } else if (locale === 'ro') {
    dateFnsLocale = await import('date-fns/locale/ro');
  } else if (locale === 'ko') {
    dateFnsLocale = await import('date-fns/locale/ko');
  } else if (locale === 'vi') {
    dateFnsLocale = await import('date-fns/locale/vi');
  } else {
    dateFnsLocale = await import('date-fns/locale/en-US');
  }

  const dfnsConf: DfnsConfig = {
    locale: dateFnsLocale.default,
  };

  return dfnsConf;
};
