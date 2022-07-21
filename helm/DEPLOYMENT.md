# Deploying WITW 

*Note* The guide below assumes you have a kuberenetes cluster setup and a working kube context for interacting with that cluster.

If you do not have a cluster ready please create one, and consult the appropriate guide for your cloud provider or other infrastructure, see [Links](#links) below for some suggestions

## Installing the Helm Chart

WITW Can be installed via `helm install` ([See Helm docs for more info](https://helm.sh/docs/helm/helm_install/))

Configuration options are documented in [helm/README.md]()

### Quick Install
To install WITW with all the default settings into it's own name space run the following from the project root
```bash
helm install --create-namespace --namespace=posthog witw ./helm
```
### Other Installation Options

[TODO]

## Links

- [Create a Kuberenetes Cluster on AWS](https://docs.aws.amazon.com/eks/latest/userguide/create-cluster.html)
- [Create a Kubernetes Cluster on GCP](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster)
- [Create a Kubernetes Cluster on Digital Ocean](https://docs.digitalocean.com/products/kubernetes/how-to/create-clusters/)

