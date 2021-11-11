FROM node:16.11 AS builder

RUN apt-get update && \
    apt-get -y install default-jre && \
    mkdir bins && \
    wget -O /bins/karate.jar https://github.com/karatelabs/karate/releases/download/v1.2.0.RC1/karate-1.2.0.RC1.jar

WORKDIR /usr/src/app

CMD mv /bins/karate.jar /usr/src/app/apiTestSuite/karate.jar && tail -f /dev/null