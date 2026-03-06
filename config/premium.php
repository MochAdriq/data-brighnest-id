<?php

return [
    'single_article_price' => 10000,
    'membership_plans' => [
        'monthly' => [
            'name' => 'Premium Bulanan',
            'amount' => 100000,
            'duration_days' => 30,
        ],
        'yearly' => [
            'name' => 'Premium Tahunan',
            'amount' => 1000000,
            'duration_days' => 365,
        ],
    ],
    'xendit' => [
        'default_channel_code' => env('XENDIT_DEFAULT_CHANNEL_CODE', 'DANA'),
        'channels' => [
            ['code' => 'DANA', 'label' => 'DANA'],
            ['code' => 'SHOPEEPAY', 'label' => 'ShopeePay'],
            ['code' => 'LINKAJA', 'label' => 'LinkAja'],
            ['code' => 'ASTRAPAY', 'label' => 'AstraPay'],
            ['code' => 'GOPAY', 'label' => 'GoPay'],
            ['code' => 'QRIS', 'label' => 'QRIS'],
            ['code' => 'BRI_VIRTUAL_ACCOUNT', 'label' => 'BRI Virtual Account'],
            ['code' => 'BCA_VIRTUAL_ACCOUNT', 'label' => 'BCA Virtual Account'],
            ['code' => 'BNI_VIRTUAL_ACCOUNT', 'label' => 'BNI Virtual Account'],
            ['code' => 'MANDIRI_VIRTUAL_ACCOUNT', 'label' => 'Mandiri Virtual Account'],
        ],
    ],
];
