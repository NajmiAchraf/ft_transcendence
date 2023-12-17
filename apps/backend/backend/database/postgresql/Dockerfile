FROM postgres

# Copying the config file into the container
COPY conf/postgresql.conf /etc/postgresql/postgresql.conf

# Setting the config file as the default config
COPY conf/script.sh /script.sh

# Running the script
RUN chmod +x /script.sh
RUN bash /script.sh
