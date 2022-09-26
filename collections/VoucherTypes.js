const VoucherDetails = {
    slug: 'voucher-types',
    admin: {
        useAsTitle: 'VoucherTypes',
    },
    upload: true,
    access: {
        create: ({ req: { user } }) => { return user.email === 'akash@payload.com'},
    },
    fields: [
        {
            name: 'type',
            type: 'text',
            localized: true,
        },
        {
            name: 'image',
            type: 'text',
        },
        {
            name: 'voucher_term_id',
            type: 'text',
            required: true
        },
    ],
}

export default VoucherDetails;