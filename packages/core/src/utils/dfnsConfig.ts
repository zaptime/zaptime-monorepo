import IZapTimeLocale from '../types/IZapTimeLocale';
import IDfnsConf from '../types/IDfnsConf';

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

export const getDfnsConfig = async (locale: IZapTimeLocale): Promise<IDfnsConf> => {
  //default enUS
  let dateFnsLocale = await import('date-fns/locale/en-US');

  if (locale.preset === 'cs') {
    dateFnsLocale = await import('date-fns/locale/cs');
  }

  const dfnsConf: IDfnsConf = {
    locale: dateFnsLocale.default,
  };

  return dfnsConf;
};
