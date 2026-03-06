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
        'default_channel_code' => env('XENDIT_DEFAULT_CHANNEL_CODE', 'ID_DANA'),
        'channels' => [
            ['code' => 'ID_DANA', 'label' => 'DANA'],
            ['code' => 'ID_SHOPEEPAY', 'label' => 'ShopeePay'],
            ['code' => 'ID_LINKAJA', 'label' => 'LinkAja'],
            ['code' => 'ID_ASTRAPAY', 'label' => 'AstraPay'],
            ['code' => 'BRI_VIRTUAL_ACCOUNT', 'label' => 'BRI Virtual Account'],
            ['code' => 'BCA_VIRTUAL_ACCOUNT', 'label' => 'BCA Virtual Account'],
            ['code' => 'MANDIRI_VIRTUAL_ACCOUNT', 'label' => 'Mandiri Virtual Account'],
        ],
    ],
];
