export interface Country {
    name: string;
    code: string;
}

export const CATEGORIZED_COUNTRIES: { [key: string]: Country[] } = {
    'Africa': [
        { name: 'Algeria', code: 'DZ' }, { name: 'Angola', code: 'AO' }, { name: 'Benin', code: 'BJ' },
        { name: 'Botswana', code: 'BW' }, { name: 'Burkina Faso', code: 'BF' }, { name: 'Burundi', code: 'BI' },
        { name: 'Cape Verde', code: 'CV' }, { name: 'Cameroon', code: 'CM' }, { name: 'Central African Republic', code: 'CF' },
        { name: 'Chad', code: 'TD' }, { name: 'Comoros', code: 'KM' }, { name: 'Congo', code: 'CG' },
        { name: 'Congo, The Democratic Republic of the', code: 'CD' }, { name: 'Cote D\'Ivoire', code: 'CI' },
        { name: 'Djibouti', code: 'DJ' }, { name: 'Egypt', code: 'EG' }, { name: 'Equatorial Guinea', code: 'GQ' },
        { name: 'Eritrea', code: 'ER' }, { name: 'Ethiopia', code: 'ET' }, { name: 'Gabon', code: 'GA' },
        { name: 'Gambia', code: 'GM' }, { name: 'Ghana', code: 'GH' }, { name: 'Guinea', code: 'GN' },
        { name: 'Guinea-Bissau', code: 'GW' }, { name: 'Kenya', code: 'KE' }, { name: 'Lesotho', code: 'LS' },
        { name: 'Liberia', code: 'LR' }, { name: 'Libyan Arab Jamahiriya', code: 'LY' }, { name: 'Madagascar', code: 'MG' },
        { name: 'Malawi', code: 'MW' }, { name: 'Mali', code: 'ML' }, { name: 'Mauritania', code: 'MR' },
        { name: 'Mauritius', code: 'MU' }, { name: 'Mayotte', code: 'YT' }, { name: 'Morocco', code: 'MA' },
        { name: 'Mozambique', code: 'MZ' }, { name: 'Namibia', code: 'NA' }, { name: 'Niger', code: 'NE' },
        { name: 'Nigeria', code: 'NG' }, { name: 'Reunion', code: 'RE' }, { name: 'Rwanda', code: 'RW' },
        { name: 'Saint Helena', code: 'SH' }, { name: 'Sao Tome and Principe', code: 'ST' }, { name: 'Senegal', code: 'SN' },
        { name: 'Seychelles', code: 'SC' }, { name: 'Sierra Leone', code: 'SL' }, { name: 'Somalia', code: 'SO' },
        { name: 'South Africa', code: 'ZA' }, { name: 'Sudan', code: 'SD' }, { name: 'Swaziland', code: 'SZ' },
        { name: 'Tanzania, United Republic of', code: 'TZ' }, { name: 'Togo', code: 'TG' }, { name: 'Tunisia', code: 'TN' },
        { name: 'Uganda', code: 'UG' }, { name: 'Western Sahara', code: 'EH' }, { name: 'Zambia', code: 'ZM' },
        { name: 'Zimbabwe', code: 'ZW' }
    ],
    'Americas': [
        { name: 'Anguilla', code: 'AI' }, { name: 'Antigua and Barbuda', code: 'AG' }, { name: 'Argentina', code: 'AR' },
        { name: 'Aruba', code: 'AW' }, { name: 'Bahamas', code: 'BS' }, { name: 'Barbados', code: 'BB' },
        { name: 'Belize', code: 'BZ' }, { name: 'Bermuda', code: 'BM' }, { name: 'Bolivia', code: 'BO' },
        { name: 'Brazil', code: 'BR' }, { name: 'Canada', code: 'CA' }, { name: 'Cayman Islands', code: 'KY' },
        { name: 'Chile', code: 'CL' }, { name: 'Colombia', code: 'CO' }, { name: 'Costa Rica', code: 'CR' },
        { name: 'Cuba', code: 'CU' }, { name: 'Dominica', code: 'DM' }, { name: 'Dominican Republic', code: 'DO' },
        { name: 'Ecuador', code: 'EC' }, { name: 'El Salvador', code: 'SV' }, { name: 'Falkland Islands (Malvinas)', code: 'FK' },
        { name: 'French Guiana', code: 'GF' }, { name: 'Greenland', code: 'GL' }, { name: 'Grenada', code: 'GD' },
        { name: 'Guadeloupe', code: 'GP' }, { name: 'Guatemala', code: 'GT' }, { name: 'Guyana', code: 'GY' },
        { name: 'Haiti', code: 'HT' }, { name: 'Honduras', code: 'HN' }, { name: 'Jamaica', code: 'JM' },
        { name: 'Martinique', code: 'MQ' }, { name: 'Mexico', code: 'MX' }, { name: 'Montserrat', code: 'MS' },
        { name: 'Netherlands Antilles', code: 'AN' }, { name: 'Nicaragua', code: 'NI' }, { name: 'Panama', code: 'PA' },
        { name: 'Paraguay', code: 'PY' }, { name: 'Peru', code: 'PE' }, { name: 'Puerto Rico', code: 'PR' },
        { name: 'Saint Kitts and Nevis', code: 'KN' }, { name: 'Saint Lucia', code: 'LC' }, { name: 'Saint Pierre and Miquelon', code: 'PM' },
        { name: 'Saint Vincent and the Grenadines', code: 'VC' }, { name: 'Suriname', code: 'SR' },
        { name: 'Trinidad and Tobago', code: 'TT' }, { name: 'Turks and Caicos Islands', code: 'TC' },
        { name: 'United States', code: 'US' }, { name: 'Uruguay', code: 'UY' }, { name: 'Venezuela', code: 'VE' },
        { name: 'Virgin Islands, British', code: 'VG' }, { name: 'Virgin Islands, U.S.', code: 'VI' }
    ],
    'Asia': [
        { name: 'Afghanistan', code: 'AF' }, { name: 'Armenia', code: 'AM' }, { name: 'Azerbaijan', code: 'AZ' },
        { name: 'Bahrain', code: 'BH' }, { name: 'Bangladesh', code: 'BD' }, { name: 'Bhutan', code: 'BT' },
        { name: 'British Indian Ocean Territory', code: 'IO' }, { name: 'Brunei Darussalam', code: 'BN' },
        { name: 'Cambodia', code: 'KH' }, { name: 'China', code: 'CN' }, { name: 'Cyprus', code: 'CY' },
        { name: 'Georgia', code: 'GE' }, { name: 'Hong Kong', code: 'HK' }, { name: 'India', code: 'IN' },
        { name: 'Indonesia', code: 'ID' }, { name: 'Iran, Islamic Republic Of', code: 'IR' }, { name: 'Iraq', code: 'IQ' },
        { name: 'Israel', code: 'IL' }, { name: 'Japan', code: 'JP' }, { name: 'Jordan', code: 'JO' },
        { name: 'Kazakhstan', code: 'KZ' }, { name: 'Korea, Democratic People\'s Republic of', code: 'KP' },
        { name: 'Korea, Republic of', code: 'KR' }, { name: 'Kuwait', code: 'KW' }, { name: 'Kyrgyzstan', code: 'KG' },
        { name: 'Lao People\'s Democratic Republic', code: 'LA' }, { name: 'Lebanon', code: 'LB' }, { name: 'Macao', code: 'MO' },
        { name: 'Malaysia', code: 'MY' }, { name: 'Maldives', code: 'MV' }, { name: 'Mongolia', code: 'MN' },
        { name: 'Myanmar', code: 'MM' }, { name: 'Nepal', code: 'NP' }, { name: 'Oman', code: 'OM' },
        { name: 'Pakistan', code: 'PK' }, { name: 'Palestinian Territory, Occupied', code: 'PS' },
        { name: 'Philippines', code: 'PH' }, { name: 'Qatar', code: 'QA' }, { name: 'Russian Federation', code: 'RU' },
        { name: 'Saudi Arabia', code: 'SA' }, { name: 'Singapore', code: 'SG' }, { name: 'Sri Lanka', code: 'LK' },
        { name: 'Syrian Arab Republic', code: 'SY' }, { name: 'Taiwan, Province of China', code: 'TW' },
        { name: 'Tajikistan', code: 'TJ' }, { name: 'Thailand', code: 'TH' }, { name: 'Timor-Leste', code: 'TL' },
        { name: 'Turkey', code: 'TR' }, { name: 'Turkmenistan', code: 'TM' }, { name: 'United Arab Emirates', code: 'AE' },
        { name: 'Uzbekistan', code: 'UZ' }, { name: 'Vietnam', code: 'VN' }, { name: 'Yemen', code: 'YE' }
    ],
    'Europe': [
        { name: 'Åland Islands', code: 'AX' }, { name: 'Albania', code: 'AL' }, { name: 'Andorra', code: 'AD' },
        { name: 'Austria', code: 'AT' }, { name: 'Belarus', code: 'BY' }, { name: 'Belgium', code: 'BE' },
        { name: 'Bosnia and Herzegovina', code: 'BA' }, { name: 'Bulgaria', code: 'BG' }, { name: 'Croatia', code: 'HR' },
        { name: 'Czech Republic', code: 'CZ' }, { name: 'Denmark', code: 'DK' }, { name: 'Estonia', code: 'EE' },
        { name: 'Faroe Islands', code: 'FO' }, { name: 'Finland', code: 'FI' }, { name: 'France', code: 'FR' },
        { name: 'Germany', code: 'DE' }, { name: 'Gibraltar', code: 'GI' }, { name: 'Greece', code: 'GR' },
        { name: 'Guernsey', code: 'GG' }, { name: 'Holy See (Vatican City State)', code: 'VA' }, { name: 'Hungary', code: 'HU' },
        { name: 'Iceland', code: 'IS' }, { name: 'Ireland', code: 'IE' }, { name: 'Isle of Man', code: 'IM' },
        { name: 'Italy', code: 'IT' }, { name: 'Jersey', code: 'JE' }, { name: 'Latvia', code: 'LV' },
        { name: 'Liechtenstein', code: 'LI' }, { name: 'Lithuania', code: 'LT' }, { name: 'Luxembourg', code: 'LU' },
        { name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK' }, { name: 'Malta', code: 'MT' },
        { name: 'Moldova, Republic of', code: 'MD' }, { name: 'Monaco', code: 'MC' }, { name: 'Netherlands', code: 'NL' },
        { name: 'Norway', code: 'NO' }, { name: 'Poland', code: 'PL' }, { name: 'Portugal', code: 'PT' },
        { name: 'Romania', code: 'RO' }, { name: 'San Marino', code: 'SM' }, { name: 'Serbia and Montenegro', code: 'CS' },
        { name: 'Slovakia', code: 'SK' }, { name: 'Slovenia', code: 'SI' }, { name: 'Spain', code: 'ES' },
        { name: 'Svalbard and Jan Mayen', code: 'SJ' }, { name: 'Sweden', code: 'SE' }, { name: 'Switzerland', code: 'CH' },
        { name: 'Ukraine', code: 'UA' }, { name: 'United Kingdom', code: 'GB' }
    ],
    'Oceania': [
        { name: 'American Samoa', code: 'AS' }, { name: 'Australia', code: 'AU' }, { name: 'Christmas Island', code: 'CX' },
        { name: 'Cocos (Keeling) Islands', code: 'CC' }, { name: 'Cook Islands', code: 'CK' }, { name: 'Fiji', code: 'FJ' },
        { name: 'French Polynesia', code: 'PF' }, { name: 'Guam', code: 'GU' }, { name: 'Heard Island and Mcdonald Islands', code: 'HM' },
        { name: 'Kiribati', code: 'KI' }, { name: 'Marshall Islands', code: 'MH' }, { name: 'Micronesia, Federated States of', code: 'FM' },
        { name: 'Nauru', code: 'NR' }, { name: 'New Caledonia', code: 'NC' }, { name: 'New Zealand', code: 'NZ' },
        { name: 'Niue', code: 'NU' }, { name: 'Norfolk Island', code: 'NF' }, { name: 'Northern Mariana Islands', code: 'MP' },
        { name: 'Palau', code: 'PW' }, { name: 'Papua New Guinea', code: 'PG' }, { name: 'Pitcairn', code: 'PN' },
        { name: 'Samoa', code: 'WS' }, { name: 'Solomon Islands', code: 'SB' }, { name: 'South Georgia and the South Sandwich Islands', code: 'GS' },
        { name: 'Tokelau', code: 'TK' }, { name: 'Tonga', code: 'TO' }, { name: 'Tuvalu', code: 'TV' },
        { name: 'United States Minor Outlying Islands', code: 'UM' }, { name: 'Vanuatu', code: 'VU' },
        { name: 'Wallis and Futuna', code: 'WF' }
    ],
    'Antarctica': [
        { name: 'Antarctica', code: 'AQ' }, { name: 'Bouvet Island', code: 'BV' }, { name: 'French Southern Territories', code: 'TF' }
    ]
};

export const ALL_COUNTRIES: Country[] = Object.values(CATEGORIZED_COUNTRIES).flat();
