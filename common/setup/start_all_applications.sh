currentpath=$(pwd)
cd $currentpath/../../communication/entities/python/collector
nohup python -u main.py >log.out 2>log.err &

echo Collector started

cd $currentpath/../../communication/entities/python/image-collector
nohup python -u main.py >log.out 2>log.err &

echo Image collector started


cd $currentpath/../../communication/entities/python/prango
nohup python -u manage.py runserver 0.0.0.0:8585 >log.out 2>log.err &

echo prango started

cd $currentpath
