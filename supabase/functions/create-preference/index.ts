import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { items, orderId } = await req.json()
        const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')

        if (!MP_ACCESS_TOKEN) {
            throw new Error('MP_ACCESS_TOKEN not set')
        }

        // Prepare preference for Mercado Pago
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: items.map((i: any) => ({
                    title: i.name,
                    unit_price: i.price,
                    quantity: i.quantity,
                    currency_id: 'CLP'
                })),
                back_urls: {
                    success: `${req.headers.get('origin')}/#success`,
                    failure: `${req.headers.get('origin')}/#failure`,
                    pending: `${req.headers.get('origin')}/#pending`,
                },
                auto_return: 'approved',
                external_reference: orderId.toString(),
            }),
        })

        const data = await response.json()

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }
})
