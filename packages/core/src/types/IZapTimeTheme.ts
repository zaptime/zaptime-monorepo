export default interface IZapTimeTheme {
  preset?: 'basic' | 'elegant' | 'playful';
  mode?: 'light' | 'dark';
  borderRadius?: string; // 4px or full
  colors?: {
    white?: string;
    black?: string;
    '25'?: string;
    '50'?: string;
    '100'?: string;
    '200'?: string;
    '300'?: string;
    '400'?: string;
    '500'?: string;
    '600'?: string;
    '700'?: string;
    '800'?: string;
    '900'?: string;

    'accent--1'?: string;
    'accent-0'?: string;
    'accent-1'?: string;
  };
}
