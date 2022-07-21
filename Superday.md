# Corban's Superday Work

## Obscure Dockerhub Names
Created dockerhub repos for built images with semi-obscure names so as not to get picked up by any search engines as beloning to post hog.
Names are ph-witw and ph-witw-db where ph-witw is (hopfully obviously to this audience) short hand for posthog-where-in-the-world


## Prioritization
### Documentation as a First-class concern
I felt it would be better to favor doing less and having a little more robust
documentation (e.g. Updated project readme, added helm read me w/ generated
params tables) given the nature of the project and company. I felt it was safe to
over index here slightly which the perspective that a feature rich chart thats
difficult to understand is a poorer community experience than a simpler chart
thats well reasoned and documented.

### Demonstrate Understanding over Feature Completion
As I understand there is an intentional aspect of providing more work than is
realistic to complete in a single day from a cold-start. With this in mind I made
sure to demonstrate an understanding of all the concepts lists, and high light
some important to me issues (liveness checks!). This is in effect a bias toward
breadth over depth which is not usually my perogative but I think it better
serves this excersize.

There are a few partially completed items, e.g. K8s Ingress. but what is present
should show a clear understanding of the concepts. I'll explain the big ones in
more detail below and aim to paint a clear picture of whats needed to take it to
completion vs where it's at.

## What was accomplished?
### The Helm Chart
I used the helm CLI to generate a boiler plate chart and re-shaped the values to
serve a multi-container deployment that brings it's own barebones Postgres container along with it.

Major improvements here would be to create a seperate chart altogether for the database and reference that as a depedency of our chart if we really wanted to maintain our own, which we may need to to satisfy the PostGIS requirement.

A more mature solution would be to look into a Postgres operator where a lot of
the intracies are already solved. While a off-the-shelf solution was available,
I wanted to self-author the solution as the project requirements ask for a
demonstrated understanding of PVs and PVCs as well as Docker which this afforded
an opportunity to do.

What my aim to build with the helm chart was a simple to deploy chart that
creates the following (or endeavors to)
- An application deployment
- A service fronting that application, of type NodePort which is usually required for ingresses
- An ingress providing ingress to the application service from outside the cluster.
This is the least touched re-source from the helm boiler plate but I think the path forward is fairly obvious.
I did not embedd this within the .Values.app as there is intended to only every\
be one ingress deployed by this chart and we may want to break the app container
in two later (front and backend) and we would probably never want an ingress for
our database in this architecture.

## Not handled
The following are identified misses due to time constraints largely
I do want to call them so as to not give the impression that the app is complete 
as-is

- Secrets for the application but these can be managed by a k8s secret reasonably well at this scale
- Ingress, mostly boiler plate.
- Optional DB inclusion, the parameter is there and the DB deployment,pv,pvc, and 
service are togglable, but some work is needed to define a remote host value that is required when .Values.postgress.enabled is false.


## Challenges
### PostGIS
Some time was lost to initial setup and navigating the PostGIS requirement.
The provided instructions did not work on Ubuntu 22.04 as-is so I elected to 
containerize the DB.

### Missing App Health Checks
Kubernetes probes matter, and they matter a lot! Without them Kubernetes is very
limited in it's ability to make decisions about your pod scheduling aka container
orchestration and thats a big value miss.

So even though it was a little out-of-scope I made a quick endeavor to add health 
checks to each pod. I didn't see any health routes defined for the backend app so
I made a (feeble) attempt to add one, I don't profess to be a django expert and 
I definitely didn't make a lot of head way here so I bailed out and used a shell
command that invokes the server management script and trusts that it will 
correctly exit with a non-zero code if/when internal errors are encountered.

For the postgres pod I used a similar utility that checks postgres's status that
is a built in part of the postgres container `pg_isready`

This may not be a bad solution for a *readiness* check in practice, but I would need to look into it more.

In the absence of robust liveness and readiness checks I placed both checks as
liveness probes so the container is restarted if/when they fail. 

## Further Extensions
Out of scope for today but there are some points I'd like to call out.
Please take the below as speculative, maybe theres a good cause for things being
the way they are. I would dig into these if there was more time.

### Seperate Application Tiers
This seems to be a 3 tier app hiding in 2 (including the added db container)
Front end and backend could be broken out into seperate containers to keep with
single responsbility principle for containers.

**Pros:** Will make scaling more granular and minimize impact of a single
container failure.

**Cons:** Service interface between front and backend may add a small amount of
latency as the two pods may live on different nodes. 

**Mitigation:** frontend and backend containers could be deployed into a single
pod which will still satisfy single responsibility principle, and guaruntee both
containers run on the same node, but will loose individual scaling capabilities.

### Move DB Migration into a K8s Job
Generally once-run tasks are well suited to a K8s job, DB migrations included.
I see the application start up script is concerned with running the migrations,
this may be normal within the Django ecosystem and acceptable but could cause some
undue pressure on the backend if the migration was large enough so making it a
once-run K8s job could be a good idea.

### Posthog API key
Currently the Posthog API key is hard-coded into `backend/apps.py` and should be 
placed in a kubernetes secret, or read in from a secrets manager service. 

### TS Build system errors
- Extension: TS build system prints an error on Browserslist: caniuse-lite being deprecated

### Further Customization of DB Later
Make the inner components of the Postgres resources configurable. Maybe the
consumer would want to use our container but supply their own PV+PVC that uses a
different storage class of their choosing i.e. an EFS backed volume via the EFS 
container storage interface.

### Helm CI and Delivery
Build and deliver the helm chart to a chart musuem, this is a fairly straight
forward task but seemed a little OOS as far as demonstrating what was asked in
the req.
