FROM tensorflow/tensorflow

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs redis-server

# Next steps:
# 1. Script maken om met LPOP messages uit de queue te lezen en die te tweeten
# 2. Uitzoeken hoe met cron dat script en generate.sh gedraaid kunnen worden
# 3. Setup in docker afronden. Totale doorloop doen van genereren, selecteren en tweeten
# 4. Alle dependencies in dockerfile zetten en checken dat alles goed geinstalleerd wordt.
# 5. Stap toevoegen aan dockerfile om model uit bucket te halen
# 6. Alles in git zetten en checken of 't op werklaptop draait
# 7. Dockerfile op digitalocean draaien
# 8. Script maken om random image uit NOS-archief te pakken
# 9. Naam verzinnen voor Bot

RUN mkdir /data

RUN mkdir /temp && curl -o /temp/model.zip https://storage.googleapis.com/nosbot_model/model.zip

RUN unzip /temp/model.zip -d /temp

# COPY generate/ /src/generate
# COPY selection/ /src/selection

WORKDIR /src/generate

RUN pip install redis

WORKDIR /src/selection

RUN npm i

RUN redis-server --daemonize yes
