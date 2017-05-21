FROM tensorflow/tensorflow

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs redis-server rsyslog

RUN mkdir /data

RUN mkdir /temp && curl -o /temp/model.zip https://storage.googleapis.com/nosbot_model/model.zip

RUN unzip /temp/model.zip -d /temp

COPY generate/ /src/generate
COPY selection/ /src/selection
COPY tweet/ /src/tweet
COPY package.json /src/package.json
COPY startup.sh /src/startup.sh

COPY process_cron /etc/cron.d/process_cron
RUN chmod 0644 /etc/cron.d/process_cron

WORKDIR /src/generate

RUN pip install redis

WORKDIR /src

RUN npm i
RUN npm i forever -g

CMD ["bash", "/src/startup.sh"]
