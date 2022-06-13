using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace NezuHack
{
    public class FlowerCtrl : MonoBehaviour
    {
        [SerializeField] Transform m_targetTr;
        // Start is called before the first frame update
        void Start()
        {
            StartCoroutine(growCo());
        }

        // Update is called once per frame
        void Update()
        {

        }

        IEnumerator growCo()
        {
            float time = 0f;
            m_targetTr.localScale = Vector3.zero;
            m_targetTr.localPosition = Vector3.zero;

            yield return new WaitForSeconds(1f);

            while (time < 1f)
            {
                time = Mathf.Min(time + Time.deltaTime*0.5f, 1f);
                m_targetTr.localScale = Vector3.one * time * 10f;
                yield return null;
            }

            yield return new WaitForSeconds(1f);

            time = 0f;
            while (time < 1f)
            {
                time = Mathf.Min(time + Time.deltaTime * 0.1f, 1f);
                m_targetTr.localPosition = Vector3.up * time * 1000f;
                yield return null;
            }

            yield return new WaitForSeconds(1f);

        }
    }
}
