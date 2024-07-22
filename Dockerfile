FROM python:3.12.2-alpine3.19
LABEL maintainer="rusipbox@gmail.com"

ENV PYTHONUNBUFFERED 1

WORKDIR wader_wave/

RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

RUN mkdir -p /files/media

RUN adduser \
         --disabled-password \
         --no-create-home \
         wander-user

RUN chown -R wander-user:wander-user /files/
RUN chmod -R 755 /files/

USER wander-user