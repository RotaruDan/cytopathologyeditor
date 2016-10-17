mkdir $1
cd $1
git clone https://github.com/RotaruDan/cytopathology.git

cd ./cytopathology

chmod +x ./gradlew
./gradlew html:dist
mkdir ../../$2
mkdir ../../$2/html

cp ./html/build/dist/* ../../$2/html
./gradlew android:assembleRelease

mkdir ../../$2/android

cp ./android/build/outputs/apk/* ../../$2/android/
rm -rf $1
