"use client";

import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { SliderWithInput } from "./slider-with-input";
import { useEditorStore } from "../../store/editor-store";
import { COMMON_STYLES, defaultThemeState } from "../../config/theme";
import { ThemeEditorState } from "@/types/editor";
import { converter } from "culori";
import { debounce } from "@/utils/debounce";
import { isDeepEqual } from "@/lib/utils";

function adjustColorByHsl(
  color: string,
  hueShift: number,
  saturationScale: number,
  lightnessScale: number
) {
  const hsl = converter("hsl")(color);
  const h = hsl?.h;
  const s = hsl?.s;
  const l = hsl?.l;
  if (h === undefined || s === undefined || l === undefined) {
    return color;
  }
  const adjustedHsl = {
    h: (((h + hueShift) % 360) + 360) % 360,
    s: Math.min(1, Math.max(0, s * saturationScale)),
    l: Math.min(1, Math.max(0.1, l * lightnessScale)),
  };

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  const out = `hsl(${formatNumber(adjustedHsl.h)} ${formatNumber(adjustedHsl.s * 100)}% ${formatNumber(adjustedHsl.l * 100)}%)`;
  return out;
}

const HslAdjustmentControls = () => {
  const { themeState, setThemeState } = useEditorStore();
  const debouncedUpdateRef = useRef<ReturnType<typeof debounce> | null>(null);

  // Memoize current HSL adjustments to prevent unnecessary recalculations
  const currentHslAdjustments = useMemo(
    () => themeState.hslAdjustments ?? defaultThemeState.hslAdjustments!,
    [themeState.hslAdjustments]
  );

  const saveThemeCheckpoint = useEditorStore((state) => state.saveThemeCheckpoint);
  const themeCheckpoint = useEditorStore((state) => state.themeCheckpoint);
  const restoreThemeCheckpoint = useEditorStore((state) => state.restoreThemeCheckpoint);

  useEffect(() => {
    if (isDeepEqual(themeState.hslAdjustments, defaultThemeState.hslAdjustments)) {
      saveThemeCheckpoint();
    }
  }, [
    themeState.hslAdjustments,
    defaultThemeState.hslAdjustments,
    restoreThemeCheckpoint,
    saveThemeCheckpoint,
  ]);

  // Setup debounced update function
  useEffect(() => {
    debouncedUpdateRef.current = debounce((hslAdjustments: ThemeEditorState["hslAdjustments"]) => {
      // Ensure we have valid adjustment values by providing defaults if undefined
      const adjustments = {
        hueShift: hslAdjustments?.hueShift ?? defaultThemeState.hslAdjustments!.hueShift,
        saturationScale:
          hslAdjustments?.saturationScale ?? defaultThemeState.hslAdjustments!.saturationScale,
        lightnessScale:
          hslAdjustments?.lightnessScale ?? defaultThemeState.hslAdjustments!.lightnessScale,
      };

      const state = themeCheckpoint ?? themeState;

      // Get non-common light styles
      const lightStyleKeys = Object.keys(state.styles.light).filter(
        (key) => !COMMON_STYLES.includes(key)
      );

      // Get non-common dark styles
      const darkStyleKeys = Object.keys(state.styles.dark).filter(
        (key) => !COMMON_STYLES.includes(key)
      );

      // Prepare light style updates
      const lightStyles = lightStyleKeys.reduce((acc, key) => {
        return {
          ...acc,
          [key]: adjustColorByHsl(
            state?.styles.light[key as keyof ThemeEditorState["styles"]["light"]],
            adjustments.hueShift,
            adjustments.saturationScale,
            adjustments.lightnessScale
          ),
        };
      }, {});

      // Prepare dark style updates
      const darkStyles = darkStyleKeys.reduce((acc, key) => {
        return {
          ...acc,
          [key]: adjustColorByHsl(
            state?.styles.dark[key as keyof ThemeEditorState["styles"]["dark"]],
            adjustments.hueShift,
            adjustments.saturationScale,
            adjustments.lightnessScale
          ),
        };
      }, {});

      // Update theme state once for all changes
      setThemeState({
        ...state,
        hslAdjustments,
        styles: {
          light: { ...state.styles.light, ...lightStyles },
          dark: { ...state.styles.dark, ...darkStyles },
        },
      });
    }, 10);

    return () => {
      debouncedUpdateRef.current?.cancel();
    };
  }, [themeState, setThemeState]);

  // Memoized handler to prevent recreation on each render
  const handleHslChange = useCallback(
    (property: keyof typeof currentHslAdjustments, value: number) => {
      const newHslAdjustments = {
        ...currentHslAdjustments,
        [property]: value,
      };

      if (debouncedUpdateRef.current) {
        debouncedUpdateRef.current(newHslAdjustments);
      }
    },
    [currentHslAdjustments]
  );

  return (
    <>
      <SliderWithInput
        value={currentHslAdjustments.hueShift}
        onChange={(value) => handleHslChange("hueShift", value)}
        unit="deg"
        min={-180}
        max={180}
        step={1}
        label="Hue Shift"
      />

      <SliderWithInput
        value={currentHslAdjustments.saturationScale}
        onChange={(value) => handleHslChange("saturationScale", value)}
        unit="x"
        min={0}
        max={2}
        step={0.01}
        label="Saturation Multiplier"
      />

      <SliderWithInput
        value={currentHslAdjustments.lightnessScale}
        onChange={(value) => handleHslChange("lightnessScale", value)}
        unit="x"
        min={0.2}
        max={2}
        step={0.01}
        label="Lightness Multiplier"
      />
    </>
  );
};

export default HslAdjustmentControls;
