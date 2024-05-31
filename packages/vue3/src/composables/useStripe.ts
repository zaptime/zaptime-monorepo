import { ref, inject, computed } from 'vue';
import { useConfig } from '@zaptime/core';

export type BillingAddress = {
  name: string;
  email: string;
  company: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  crn: string;
  vatId: string;
};

export function useStripe() {
  const result = ref();
  const errors = ref();
  const elements = ref<stripe.elements.Elements>();
  const stripe = ref<stripe.Stripe>();
  const stripeCardNumber = ref<stripe.elements.Element>();
  const stripeCardExpiry = ref<stripe.elements.Element>();
  const stripeCardCvc = ref<stripe.elements.Element>();
  const { config } = useConfig(inject('calendarId'));

  const isDark = config.value.theme?.mode === 'dark';

  const elementClasses = {
    focus: 'focused',
    empty: 'empty',
    invalid: 'invalid',
  };

  const API_BASE_URL = 'https://api.zaptime.app/';

  const apiBaseUrl = computed(() => {
    return config.value.apiBaseUrl || API_BASE_URL;
  });

  const elementStyles = computed(() => {
    return {
      base: {
        // @ts-expect-error values are actually required
        color: isDark ? config.value.theme.colors[100] : config.value.theme.colors[900],
        fontWeight: 600,
        fontFamily:
          '"Basier Circle", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        fontSize: '14px',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          // @ts-expect-error values are actually required
          color: isDark ? config.value.theme.colors[500] : config.value.theme.colors[400],
        },
        ':-webkit-autofill': {
          // @ts-expect-error values are actually required
          color: isDark ? config.value.theme.colors[500] : config.value.theme.colors[900],
        },
        ':focus': {},
      },
      invalid: {
        color: '#E25950',
        '::placeholder': {
          color: '#FFCCA5',
        },
      },
    };
  });

  async function initGateway(stripeAccountId: string) {
    stripe.value = Stripe(import.meta.env.VITE_STRIPE_CLIENT_KEY, {
      stripeAccount: stripeAccountId,
    });

    elements.value = stripe.value.elements();

    stripeCardNumber.value = elements.value.create('cardNumber', {
      style: elementStyles.value,
      classes: elementClasses,
    });

    stripeCardExpiry.value = elements.value.create('cardExpiry', {
      style: elementStyles.value,
      classes: elementClasses,
    });

    stripeCardCvc.value = elements.value.create('cardCvc', {
      style: elementStyles.value,
      classes: elementClasses,
    });

    stripeCardNumber.value.mount('#card-number');
    stripeCardExpiry.value.mount('#card-expiry');
    stripeCardCvc.value.mount('#card-cvc');
  }

  async function handleSubmit({ billingAddress }: { billingAddress: BillingAddress }) {
    if (stripe.value === undefined || stripeCardNumber.value === undefined) {
      return;
    }

    // const { error } = await stripe.value.confirmPayment({
    //   elements: elements.value,
    //   redirect: 'if_required',
    // });

    const res = await fetch(apiBaseUrl.value + 'api/payments', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + config.value.token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: billingAddress.email,
        name: billingAddress.name,
        company: billingAddress.company || undefined,
        street: billingAddress.address || undefined,
        city: billingAddress.city || undefined,
        postalCode: billingAddress.postalCode || undefined,
        country: billingAddress.country,
        taxId: billingAddress.vatId || undefined,
        crn: billingAddress.crn || undefined,
      }),
    });

    const { data } = await res.json();

    if (data.clientSecret === undefined) {
      return;
    }

    const { error } = await stripe.value.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card: stripeCardNumber.value,
        billing_details: {
          name: billingAddress.name,
          email: billingAddress.email,
          address: {
            postal_code: billingAddress.postalCode,
            city: billingAddress.city,
            country: billingAddress.country,
            line1: billingAddress.address,
          },
        },
      },
    });

    if (error !== undefined) {
      throw new Error(error.code);
    }
  }

  return {
    initGateway,
    handleSubmit,
    errors,
    result,
  };
}
