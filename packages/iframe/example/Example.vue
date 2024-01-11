<template>
  <App />
</template>

<script setup lang="ts">
import App from '../src/App.vue';

// Faking xprops for the example
window.xprops = {
  type: 'multiple',
  config: {
    token: 'l301cB5s4KETF7yBaLGic03xaz8QjNcZ',
    title: 'John Doe',
    theme: {
      mode: 'dark',
      borderRadius: '4px',
    },
    description: 'Chcete se potkat? Online nebo offline? Vyberte si, co spolu budeme řešit, a rezervujte si mě na potřebnou dobu. www.jajsemandre.cz',
    avatar: 'https://d3v0px0pttie1i.cloudfront.net/uploads/user/avatar/25368117/892014ce.jpg',
    eventTypes: [
      {
        token: 'l301cB5s4KETF7yBaLGic03xaz8QjNcZ',
        title: 'André - konzultace',
        description: 'Potřebujete se se mnou potkat? Můžeme se potkat osobně v Praze, nebo na Google Meetu. Vyberte si termín, napište co chcete řešit a domluvíme se, kde a jak se potkáme.',
        duration: 30,
      },

      {
        token: 'l301cB5s4KETF7yBaLGic03xaz8QjNcZ',
        title: 'André - konzultace',
        description: 'Potřebujete se se mnou potkat? Můžeme se potkat osobně v Praze, nebo na Google Meetu. Vyberte si termín, napište co chcete řešit a domluvíme se, kde a jak se potkáme.',
        duration: 30,
      },

      {
        token: 'l301cB5s4KETF7yBaLGic03xaz8QjNcZ',
        title: 'André - konzultace',
        description: 'Potřebujete se se mnou potkat? Můžeme se potkat osobně v Praze, nebo na Google Meetu. Vyberte si termín, napište co chcete řešit a domluvíme se, kde a jak se potkáme.',
        duration: 60,
      },

      {
        token: 'l301cB5s4KETF7yBaLGic03xaz8QjNcZ',
        title: 'André - konzultace',
        description: 'Potřebujete se se mnou potkat? Můžeme se potkat osobně v Praze, nebo na Google Meetu. Vyberte si termín, napište co chcete řešit a domluvíme se, kde a jak se potkáme.',
      },

      {
        token: 'l301cB5s4KETF7yBaLGic03xaz8QjNcZ',
        title: 'André - konzultace',
        description: 'Potřebujete se se mnou potkat? Můžeme se potkat osobně v Praze, nebo na Google Meetu. Vyberte si termín, napište co chcete řešit a domluvíme se, kde a jak se potkáme.',
        duration: 15,
      },

      {
        token: 'l301cB5s4KETF7yBaLGic03xaz8QjNcZ',
        title: 'André - konzultace',
        description: 'Potřebujete se se mnou potkat? Můžeme se potkat osobně v Praze, nebo na Google Meetu. Vyberte si termín, napište co chcete řešit a domluvíme se, kde a jak se potkáme.',
        duration: 15,
      },

      {
        token: 'l301cB5s4KETF7yBaLGic03xaz8QjNcZ',
        title: 'André - konzultace',
        description: 'Potřebujete se se mnou potkat? Můžeme se potkat osobně v Praze, nebo na Google Meetu. Vyberte si termín, napište co chcete řešit a domluvíme se, kde a jak se potkáme.',
        duration: 15,
      },
    ],
  },
};
</script>
