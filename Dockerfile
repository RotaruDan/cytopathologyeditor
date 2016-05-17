FROM node:4

WORKDIR /home/cytoeditor

# Install cytoeditor Prerequisites
RUN npm install -g grunt-cli
RUN npm install -g bower

# Install cytoeditor packages
ADD package.json /home/cytoeditor/package.json
RUN npm install

# Manually trigger bower. Why doesnt this work via npm install?
ADD .bowerrc /home/mean/.bowerrc
# ADD bower.json /home/mean/bower.json
# RUN bower install --config.interactive=false --allow-root

# Make everything available for start
ADD . /home/cytoeditor

# currently only works for development
ENV NODE_ENV development

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729
CMD ["grunt"]
