const VoucherDetails = {
    slug: 'voucher-details',
    admin: {
        useAsTitle: 'VoucherDetails',
    },
    access: {
        create: ({ req: { user } }) => { return user.email === 'akash@payload.com' },
        delete: () => false
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            localized: true,
        },
        {
            name: 'details',
            type: 'array',
            fields: [
                {
                    name: 'src',
                    type: 'text',
                }
            ]
        },
        {
            name: 'backgroundImage', // required
            type: 'upload', // required
            relationTo: 'voucher-types', // required
            required: true,
          },

        {
            name: 'pageMeta', // required
            type: 'group', // required
            fields: [ // required
                {
                    name: 'voucherId',
                    type: 'text',
                    required: true,
                    minLength: 20,
                    maxLength: 100,
                },
                {
                    name: 'description',
                    type: 'textarea',
                    required: true,
                    minLength: 40,
                    maxLength: 160,
                }
            ],
        },
        {
            name: 'isDeleted', // required
            type: 'checkbox', // required
            label: 'Click me to delete document',
            defaultValue: false,
        },
        {
            name: 'updatedBy', // required
            type: 'email', // required
            defaultValue: undefined,
            hooks: {
                beforeChange: [(args) => {
                    console.log('>>>>>>>>>>>', args.req.user)
                    if(args.operation === 'update'){
                        return args.req?.user?.email;
                    }
                    // if (args.data?.isDeleted === true) {
                    //     return new Date().toISOString();
                    // }
                    return args.value;
                }],
            },
            hidden: true,
        },
        {
            name: 'deletedBy',
            type: 'email',
            defaultValue: undefined,
            hooks: {
                beforeChange: [(args) => {
                    if (args.data?.isDeleted === true) {
                        return args.req?.user?.email;
                    }
                    return null;
                }],
            },
            hidden: true,
        },
        {
            name: 'deletedAt', // required
            type: 'date', // required
            label: 'Deleted Time',
            defaultValue: undefined,
            admin: {
                condition: (data, siblingData) => {
                    if (data.isDeleted) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            hooks: {
                beforeChange: [(args) => {
                    if (args.data?.isDeleted === true) {
                        return new Date().toISOString();
                    }
                    return null
                }],
            },
            hidden: true,
        }
    ],
    hooks: {
        beforeOperation: [({ args, operation }) => {
            if (args?.data?.isDeleted === true) {
                args = {
                    ...args,
                    data: {
                        ...args?.data,
                        deletedAt: new Date().toISOString(),
                    }
                }
            }
            if (args?.data?.isDeleted === false) {
                args = {
                    ...args,
                    data: {
                        ...args?.data,
                        deletedAt: null,
                    }
                }
            }
            if (operation === 'read') {
                args = {
                    ...args,
                    where: {
                        and: [
                            {

                                isDeleted: {
                                    equals: false
                                }

                            },
                            {
                                or: [].concat(args.where?.or || [])
                            }
                        ]
                    }
                }
            }
            return args;
        }],
        beforeChange: [({
            data, req, operation
        }) => {
            if (data.isDeleted === true) {
                data = {
                    ...data,
                    deletedAt: new Date().toISOString(),
                }
                req.body = {
                    ...req.body,
                    deletedAt: new Date().toISOString(),
                }
                return data;
            }
            data = {
                ...data,
                deletedAt: null,
            }
            req.body = {
                ...req.body,
                deletedAt: null,
            }
            return data;
        }]
    },
}

export default VoucherDetails;