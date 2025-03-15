import { EditorConfig } from '@/types/editor';
import { ThemeEditorState } from '@/types/theme';
import ThemeControlPanel from '@/components/editor/ThemeControlPanel';
import ThemePreviewPanel from '@/components/editor/ThemePreviewPanel';
import { generateThemeCode } from '@/utils/themeStyleGenerator';

const defaultLightThemeStyles = {
  background: 'oklch(1 0 0)',
  foreground: 'oklch(0.145 0 0)',
  card: 'oklch(1 0 0)',
  'card-foreground': 'oklch(0.145 0 0)',
  popover: 'oklch(1 0 0)',
  'popover-foreground': 'oklch(0.145 0 0)',
  primary: 'oklch(0.205 0 0)',
  'primary-foreground': 'oklch(0.985 0 0)',
  secondary: 'oklch(0.97 0 0)',
  'secondary-foreground': 'oklch(0.205 0 0)',
  muted: 'oklch(0.97 0 0)',
  'muted-foreground': 'oklch(0.556 0 0)',
  accent: 'oklch(0.97 0 0)',
  'accent-foreground': 'oklch(0.205 0 0)',
  destructive: 'oklch(0.577 0.245 27.325)',
  'destructive-foreground': 'oklch(0.577 0.245 27.325)',
  border: 'oklch(0.922 0 0)',
  input: 'oklch(0.922 0 0)',
  ring: 'oklch(0.708 0 0)',
  'chart-1': 'oklch(0.646 0.222 41.116)',
  'chart-2': 'oklch(0.6 0.118 184.704)',
  'chart-3': 'oklch(0.398 0.07 227.392)',
  'chart-4': 'oklch(0.828 0.189 84.429)',
  'chart-5': 'oklch(0.769 0.188 70.08)',
  radius: '0.625rem',
  sidebar: 'oklch(0.985 0 0)',
  'sidebar-foreground': 'oklch(0.145 0 0)',
  'sidebar-primary': 'oklch(0.205 0 0)',
  'sidebar-primary-foreground': 'oklch(0.985 0 0)',
  'sidebar-accent': 'oklch(0.97 0 0)',
  'sidebar-accent-foreground': 'oklch(0.205 0 0)',
  'sidebar-border': 'oklch(0.922 0 0)',
  'sidebar-ring': 'oklch(0.708 0 0)',
};

const defaultDarkThemeStyles = {
  background: 'oklch(0.145 0 0)',
  foreground: 'oklch(0.985 0 0)',
  card: 'oklch(0.145 0 0)',
  'card-foreground': 'oklch(0.985 0 0)',
  popover: 'oklch(0.145 0 0)',
  'popover-foreground': 'oklch(0.985 0 0)',
  primary: 'oklch(0.985 0 0)',
  'primary-foreground': 'oklch(0.205 0 0)',
  secondary: 'oklch(0.269 0 0)',
  'secondary-foreground': 'oklch(0.985 0 0)',
  muted: 'oklch(0.269 0 0)',
  'muted-foreground': 'oklch(0.708 0 0)',
  accent: 'oklch(0.269 0 0)',
  'accent-foreground': 'oklch(0.985 0 0)',
  destructive: 'oklch(0.396 0.141 25.723)',
  'destructive-foreground': 'oklch(0.637 0.237 25.331)',
  border: 'oklch(0.269 0 0)',
  input: 'oklch(0.269 0 0)',
  ring: 'oklch(0.556 0 0)',
  'chart-1': 'oklch(0.488 0.243 264.376)',
  'chart-2': 'oklch(0.696 0.17 162.48)',
  'chart-3': 'oklch(0.769 0.188 70.08)',
  'chart-4': 'oklch(0.627 0.265 303.9)',
  'chart-5': 'oklch(0.645 0.246 16.439)',
  radius: '0.625rem',
  sidebar: 'oklch(0.205 0 0)',
  'sidebar-foreground': 'oklch(0.985 0 0)',
  'sidebar-primary': 'oklch(0.488 0.243 264.376)',
  'sidebar-primary-foreground': 'oklch(0.985 0 0)',
  'sidebar-accent': 'oklch(0.269 0 0)',
  'sidebar-accent-foreground': 'oklch(0.985 0 0)',
  'sidebar-border': 'oklch(0.269 0 0)',
  'sidebar-ring': 'oklch(0.439 0 0)',
};

const defaultThemeState: ThemeEditorState = {
  styles: {
    light: defaultLightThemeStyles,
    dark: defaultDarkThemeStyles,
  },
  currentMode: 'light',
};

export const themeEditorConfig: EditorConfig = {
  type: 'theme',
  name: 'Theme',
  description: 'Customize your global theme colors',
  defaultState: defaultThemeState,
  controls: ThemeControlPanel,
  preview: ThemePreviewPanel,
  codeGenerator: {
    generateComponentCode: generateThemeCode,
  },
}; 