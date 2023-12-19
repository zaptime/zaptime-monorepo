import ZaptimeLocale from '../types/ZaptimeLocale';
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

export const getDfnsConfig = async (locale: ZaptimeLocale | undefined): Promise<DfnsConfig> => {
  let dateFnsLocale = undefined;

  if (locale === undefined) {
    dateFnsLocale = await import('date-fns/locale/en-US');
    const dfnsConf: DfnsConfig = {
      locale: dateFnsLocale.default,
    };

    return dfnsConf;
  }

  if (locale.preset === 'cs') {
    dateFnsLocale = await import('date-fns/locale/cs');
  } else if (locale.preset === 'sk') {
    dateFnsLocale = await import('date-fns/locale/sk');
  } else if (locale.preset === 'pl') {
    dateFnsLocale = await import('date-fns/locale/pl');
  } else if (locale.preset === 'de') {
    dateFnsLocale = await import('date-fns/locale/de');
  } else if (locale.preset === 'pt') {
    dateFnsLocale = await import('date-fns/locale/pt');
  } else if (locale.preset === 'es') {
    dateFnsLocale = await import('date-fns/locale/es');
  } else if (locale.preset === 'ja') {
    dateFnsLocale = await import('date-fns/locale/ja');
  } else if (locale.preset === 'zh') {
    dateFnsLocale = await import('date-fns/locale/zh-CN');
  } else if (locale.preset === 'tr') {
    dateFnsLocale = await import('date-fns/locale/tr');
  } else if (locale.preset === 'sv') {
    dateFnsLocale = await import('date-fns/locale/sv');
  } else if (locale.preset === 'nl') {
    dateFnsLocale = await import('date-fns/locale/nl');
  } else if (locale.preset === 'it') {
    dateFnsLocale = await import('date-fns/locale/it');
  } else if (locale.preset === 'fi') {
    dateFnsLocale = await import('date-fns/locale/fi');
  } else if (locale.preset === 'ro') {
    dateFnsLocale = await import('date-fns/locale/ro');
  } else if (locale.preset === 'ko') {
    dateFnsLocale = await import('date-fns/locale/ko');
  } else if (locale.preset === 'vi') {
    dateFnsLocale = await import('date-fns/locale/vi');
  } else {
    dateFnsLocale = await import('date-fns/locale/en-US');
  }

  const dfnsConf: DfnsConfig = {
    locale: dateFnsLocale.default,
  };

  return dfnsConf;
};
