[Home](./index) &gt; [kibana-plugin-server](./kibana-plugin-server.md) &gt; [ClusterClient](./kibana-plugin-server.clusterclient.md) &gt; [asScoped](./kibana-plugin-server.clusterclient.asscoped.md)

## ClusterClient.asScoped() method

Creates an instance of `ScopedClusterClient` based on the configuration the current cluster client that exposes additional `callAsCurrentUser` method scoped to the provided req. Consumers shouldn't worry about closing scoped client instances, these will be automatically closed as soon as the original cluster client isn't needed anymore and closed.

<b>Signature:</b>

```typescript
asScoped(req?: {
        headers?: Headers;
    }): ScopedClusterClient;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  req | <code>{`<p/>`        headers?: Headers;`<p/>`    }</code> | Request the <code>ScopedClusterClient</code> instance will be scoped to. |

<b>Returns:</b>

`ScopedClusterClient`
