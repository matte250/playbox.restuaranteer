echo "Starting tests"
wget -q -nc -O karate.jar https://github.com/karatelabs/karate/releases/download/v1.2.0.RC1/karate-1.2.0.RC1.jar
java -Dconf.baseurl='http://localhost:3000' -jar ./karate.jar -cp ./ ../
