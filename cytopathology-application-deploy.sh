mkdir -p $1
mkdir -p $2/html
mkdir -p $2/android
cd $1
git clone https://github.com/RotaruDan/cytopathology.git

cd ./cytopathology

chmod +x ./gradlew
./gradlew html:dist

cp ./html/build/dist/* $2/html
./gradlew android:assembleRelease

cp ./android/build/outputs/apk/* $2/android/
rm -rf $1
