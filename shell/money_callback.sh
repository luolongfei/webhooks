#! /bin/bash

SITE_PATH='/data/www/sm.feifei.cf/'

# shellcheck disable=SC2164
cd $SITE_PATH

git pull
php artisan migrate