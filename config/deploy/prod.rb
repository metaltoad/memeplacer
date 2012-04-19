# Set the deployment directory on the target hosts.
set :deploy_to, "/var/www/memeplacer"

# The hostnames to deploy to.
role :web, '10.10.20.51'

set :gateway, 'mgt2.copperfroghosting.com'

# The username on the target system, if different from your local username
ssh_options[:user] = 'deploy'