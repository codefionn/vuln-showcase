FROM ubuntu:22.04

RUN ln -sf /usr/share/zoneinfo/UTC /etc/localtime
RUN apt-get update -y
RUN apt-get install -y postgresql

CMD [ "/usr/bin/env", "sh", "/init-sql/run.sh" ]