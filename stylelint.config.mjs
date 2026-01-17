/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-order", "stylelint-declaration-strict-value", "stylelint-selector-bem-pattern"],
  ignoreFiles: ["./dist/**", "./styles/*.css"],
  cache: true,
  rules: {
    "declaration-empty-line-before": null,
    "selector-class-pattern": null,
    "plugin/selector-bem-pattern": {
      preset: "bem",
      componentSelectors: {
        initial: "^\\.{componentName}(?:__[a-z]+(?:-[a-z]+)*)?(?:--[a-z]+(?:-[a-z]+)*)?$",
      },
    },
    // Сортируем свойства
    "order/properties-order": [
      [
        {
          groupName: "Позиционирование",
          emptyLineBefore: "always",
          properties: ["position", "z-index", "top", "right", "bottom", "left"],
          noEmptyLineBetween: true,
          order: "flexible",
        },
        {
          groupName: "Отображение",
          emptyLineBefore: "always",
          properties: ["display", "visibility", "overflow", "flex", "grid"],
          noEmptyLineBetween: true,
          order: "flexible",
        },
        {
          groupName: "Размеры и отступы",
          emptyLineBefore: "always",
          properties: ["width", "height", "margin", "padding", "padding-top", "padding-right", "padding-bottom", "padding-left", "box-sizing"],
          noEmptyLineBetween: true,
          order: "flexible",
        },
        {
          groupName: "Типографика",
          emptyLineBefore: "always",
          properties: ["font", "text-align", "text-decoration"],
          noEmptyLineBetween: true,
          order: "flexible",
        },
        {
          groupName: "Визуальное оформление",
          emptyLineBefore: "always",
          properties: ["color", "background-color", "border", "border-radius", "box-shadow"],
          noEmptyLineBetween: true,
          order: "flexible",
        },
        {
          groupName: "Анимации и трансформации",
          emptyLineBefore: "always",
          properties: ["transform", "animation", "transition"],
          noEmptyLineBetween: true,
          order: "flexible",
        },
      ],
      {
        unspecified: "bottomAlphabetical",
        emptyLineBeforeUnspecified: "always",
      },
    ],
    // Используем css-переменные
    "scale-unlimited/declaration-strict-value": [
      [
        "/color$/",
        "/border-color$/",
        "border-radius",
        "/font/",
        "font-size",
        "font-weight",
        "font-family",
        "line-height",
        "letter-spacing",
      ],
      {
        ignoreValues: ["transparent", "currentColor", "inherit", "normal", "bold", "sans-serif", "serif"],
      },
    ],
  },
};
