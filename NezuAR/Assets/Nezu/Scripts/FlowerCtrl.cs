using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace NezuHack
{
    public class FlowerCtrl : MonoBehaviour
    {
        [SerializeField] Transform m_targetTr;
        [SerializeField] AnimationCurve m_scaleAC;
        [SerializeField] AudioSource m_audioSource;
        [SerializeField] ParticleSystem m_ps;
        [SerializeField] ParticleSystem m_smokePs;
        [SerializeField] AudioClip m_growClip;
        [SerializeField] AudioClip m_finishClip;
        [SerializeField] AudioClip m_jumpClip;
        [SerializeField] float m_maxRate;

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
            m_maxRate = 0f;
            float time = 0f;
            m_targetTr.localScale = Vector3.zero;
            m_targetTr.localPosition = Vector3.zero;

            yield return new WaitForSeconds(1f);

            while (time < 1f)
            {
                time = Mathf.Min(time + Time.deltaTime*0.5f, m_maxRate);
                m_targetTr.localScale = Vector3.one * m_scaleAC.Evaluate(time) * 10f;
                yield return null;
            }

            m_audioSource.PlayOneShot(m_finishClip);

            yield return new WaitForSeconds(1f);

            m_audioSource.clip = m_jumpClip;
            m_audioSource.Play();

            m_smokePs.Play();
            time = 0f;
            while (time < 1f)
            {
                time = Mathf.Min(time + Time.deltaTime * 0.1f, 1f);
                m_targetTr.localPosition = Vector3.up * time * 1000f;
                yield return null;
            }

            yield return new WaitForSeconds(1f);
            StartCoroutine(growCo());

        }
        IEnumerator efcCo()
        {
            m_audioSource.clip = m_growClip;
            m_audioSource.Play();
            yield return new WaitForSeconds(0.3f);
            m_ps.Play();
        }

        /// <summary>
        /// 成長させるボタン
        /// </summary>
        /// <param name="_powerRate">0-1の値を入れる.加算した値が1になったら成長完了</param>
        public void OnPowerButton(float _powerRate)
        {
            m_maxRate = Mathf.Min(m_maxRate + _powerRate, 1f);
            StartCoroutine(efcCo());
        }
    }
}
