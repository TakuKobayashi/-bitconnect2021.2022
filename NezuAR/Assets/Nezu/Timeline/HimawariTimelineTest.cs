using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;

public class HimawariTimelineTest : MonoBehaviour
{
    [SerializeField] PlayableDirector m_timeline;

    // Start is called before the first frame update
    void Start()
    {
        StartCoroutine(glowCo());
    }

    // Update is called once per frame
    void Update()
    {
        m_timeline.Play();
    }

    IEnumerator glowCo()
    {
        m_timeline.Play();
        yield return new WaitForSeconds(0.1f);
        m_timeline.Pause();
        yield return new WaitForSeconds(2f);
        m_timeline.Play();
        yield return null;
    }
}
